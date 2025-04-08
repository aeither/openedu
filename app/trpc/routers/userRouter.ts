import { createTRPCRouter, publicProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "@/db/drizzle"; 
import { users } from "@/db/schema"; 

export const userRouter = createTRPCRouter({
    me: publicProcedure.query(() => ({ name: "John Doe" })),
    
    createUser: publicProcedure
        .input(z.object({
            userAddress: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Create or ignore existing user
                await db
                    .insert(users)
                    .values({
                        address: input.userAddress,
                        lastActive: new Date(),
                    })
                    .onConflictDoNothing();

                return {
                    success: true,
                    message: "User created or already exists",
                };
            } catch (error: any) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create user: " + error.message
                });
            }
        }),
});
