import { SEND_REWARD_AMOUNT } from "@/constants";
import { db } from "@/db/drizzle"; // Adjust based on your database setup
import { campaigns, tasks, users } from "@/db/schema"; // Adjust based on your schema file location
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm"; // Import sql from drizzle-orm
import { createPublicClient, createWalletClient, erc721Abi, http, parseEther } from "viem";
import { privateKeyToAccount } from 'viem/accounts';
import { cronos, sepolia } from "viem/chains";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init"; // Adjust based on your init file location

export function getChainById(chainId: number) {
    switch (chainId) {
        case cronos.id:
            return cronos;
        case cronos.id:
            return sepolia;
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`);
    }
}

function getPublicClient(chainId: number) {
    // Map containing only Cronos and Sepolia
    const chains = {
        25: cronos,
        11155111: sepolia,
    }

    // Get the chain from the map or default to Sepolia
    const chain = chains[chainId as keyof typeof chains] || sepolia

    // Create and return the public client
    const publicClient = createPublicClient({
        chain,
        transport: http(),
        batch: {
            multicall: true,
        },
    })

    return publicClient
}

function getAdminWalletClient(chainId: number) {
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;
  if (!ADMIN_PRIVATE_KEY) {
    throw new Error('Admin private key not found in environment variables');
  }
  
  const adminAccount = privateKeyToAccount(ADMIN_PRIVATE_KEY);
  const walletClient = createWalletClient({
    account: adminAccount,
    chain: getChainById(chainId),
    transport: http(),
  });
  
  return walletClient;
}

export const taskRouter = createTRPCRouter({
    checkTaskCompleted: publicProcedure
        .input(
            z.object({
                userAddress: z.string(),
                chainId: z.number(),
            })
        )
        .query(async ({ input }) => {
            const task = await db
                .select({ completed: tasks.completed })
                .from(tasks)
                .where(
                    and(
                        eq(tasks.userAddress, input.userAddress),
                        eq(tasks.taskName, "welcome")
                    )
                );
            return task.length > 0 ? task[0] : { completed: false };
        }),

    getCampaignStatus: publicProcedure
        .query(async () => {
            const campaign = await db
                .select({
                    id: campaigns.id,
                    name: campaigns.name,
                    totalAmount: campaigns.totalAmount,
                    currentAmount: campaigns.currentAmount,
                })
                .from(campaigns)
                .where(eq(campaigns.name, "Try to Earn Giveaway"))
                .limit(1);

            if (campaign.length === 0) {
                throw new TRPCError({ 
                    code: "NOT_FOUND", 
                    message: "Campaign not found" 
                });
            }

            return campaign[0];
        }),

    setTaskWelcomeCompleted: publicProcedure
        .input(
            z.object({
                userAddress: z.string(),
                chainId: z.number(),
            })
        )
        .mutation(async ({ input }) => {
            return await db.transaction(async (tx) => {
                // Check NFT balance first
                const publicClient = getPublicClient(input.chainId);
                const nftBalance = await publicClient.readContract({
                    address: process.env.NFT_CONTRACT_ADDRESS as `0x${string}`,
                    abi: erc721Abi,
                    functionName: "balanceOf",
                    args: [input.userAddress as `0x${string}`],
                });

                if (Number(nftBalance) < 10) {
                    throw new TRPCError({
                        code: "PRECONDITION_FAILED",
                        message: "You need at least 10 NFTs to complete this task",
                    });
                }

                // Update task completion
                const result = await tx
                    .update(tasks)
                    .set({ completed: true })
                    .where(
                        and(
                            eq(tasks.userAddress, input.userAddress),
                            eq(tasks.taskName, "welcome")
                        )
                    )
                    .returning();

                if (result.length === 0) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
                }

                try {
                    const hash = await getAdminWalletClient(input.chainId).sendTransaction({
                        to: input.userAddress as `0x${string}`,
                        value: parseEther(SEND_REWARD_AMOUNT), 
                    });

                    // Update campaign amount
                    await tx
                        .update(campaigns)
                        .set({ 
                            currentAmount: sql`${campaigns.currentAmount} + 2`,
                            updatedAt: sql`CURRENT_TIMESTAMP`
                        })
                        .where(eq(campaigns.name, "Try to Earn Giveaway"));

                    return {
                        message: "Task marked as completed and 2 ETH sent.",
                        task: result[0],
                        transactionHash: hash
                    };
                } catch (error) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to send ETH",
                        cause: error,
                    });
                }
            });
        }),

    createUserWithWelcomeTask: publicProcedure
        .input(z.object({
            userAddress: z.string(),
        }))
        .mutation(async ({ input }) => {
            return await db.transaction(async (tx) => {
                // Create or ignore existing user
                await tx
                    .insert(users)
                    .values({
                        address: input.userAddress,
                    })
                    .onConflictDoNothing();

                // Create welcome task, handle potential conflict
                try {
                    const createdTask = await tx
                        .insert(tasks)
                        .values({
                            id: `${input.userAddress}-welcome`,
                            userAddress: input.userAddress,
                            taskName: "welcome",
                            completed: false,
                        })
                        .returning();

                    return {
                        message: "User and welcome task created successfully",
                        task: createdTask[0]
                    };
                } catch (error: any) {
                    if (error.message.includes('duplicate key')) {
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: "Welcome task already exists for this user"
                        });
                    }
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to create welcome task: " + error.message
                    });
                }
            });
        }),
});
