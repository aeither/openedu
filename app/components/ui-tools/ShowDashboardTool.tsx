import { cronologicalNFTAbi } from "@/abi/cronologicalNFT";
import { Button } from "@/components/ui/button";
import { NFT_CONTRACT_ADDRESS, SEND_REWARD_AMOUNT } from "@/constants";
import type { Campaign } from "@/db/schema"; // Import Campaign type
import { useTRPC } from "@/trpc/react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react"; // Import icons
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useReadContract } from "wagmi";
import { cronos } from "wagmi/chains";

export default function ShowDashboardTool() {
  const { address, chainId, chain } = useAccount();
  const [txHash, setTxHash] = useState<string>();
  const trpc = useTRPC();
  const baseUrl = chain?.blockExplorers?.default.url;

  // Get task completion status
  const taskQuery = useSuspenseQuery(
    trpc.task.checkTaskCompleted.queryOptions({
      userAddress: address || "",
      chainId: chainId ?? cronos.id,
    })
  );

  const taskCompleted = taskQuery.data?.completed;

  // --- NEW: Get Campaign Status ---
  const campaignQuery = useSuspenseQuery(trpc.task.getCampaignStatus.queryOptions());
  const campaign = campaignQuery.data as Campaign | undefined; // Cast or ensure type
  const isCampaignOver = campaign ? Number(campaign.currentAmount) >= Number(campaign.totalAmount) : false;

  // Mutation for marking the task as completed
  const completeMutation = useMutation(
    trpc.task.setTaskWelcomeCompleted.mutationOptions({
      onSuccess: (data) => {
        setTxHash(data.transactionHash);
        taskQuery.refetch();
        campaignQuery.refetch(); // Refetch campaign status after claim
      },
      onError: (error) => {
        // Optional: Add user feedback for claim errors
        console.error("Claim failed:", error);
        toast(`Claim failed: ${error.message}`); // Simple alert for now
      }
    })
  );

  // Get NFT balance
  const { data: nftBalance, isError: nftBalanceError, isLoading: nftBalanceLoading } = useReadContract({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: cronologicalNFTAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: chainId || cronos.id,
    query: { enabled: !!address },
  });

  const formattedBalance = nftBalance ? Number(nftBalance.toString()) : 0;
  // --- UPDATED: canClaim logic ---
  const canClaim = !taskCompleted && formattedBalance >= 10 && !isCampaignOver;
  const isClaiming = completeMutation.isPending;
  const isClaimed = taskCompleted;

  const handleClaimCro = async () => {
    if (!address || !chainId || isClaiming || isClaimed || isCampaignOver) return; // Added isCampaignOver check
    await completeMutation.mutateAsync({
      userAddress: address,
      chainId: chainId || cronos.id,
    });
  };

  if (!address) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Connect your wallet to view NFT balance</p>
      </div>
    );
  }

  // Loading state (Keep existing skeleton/loading)
  if (nftBalanceLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        {/* Using a simple text loader, replace with Skeleton if preferred */}
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading balance...</span>
        <div className="animate-pulse h-12 w-48 bg-gray-200 rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">
            🎮 NFT Dashboard
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Collect 10 NFTs to claim your reward!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Display Campaign Status (Optional but helpful) */}
          {campaign && (
            <div className="text-xs text-center text-muted-foreground">
              Campaign Status: {campaign.currentAmount} / {campaign.totalAmount} CRO claimed.
              {isCampaignOver && <span className="text-red-500 ml-1">(Ended)</span>}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Your NFT Balance
            </span>
            <span className={`text-sm font-bold ${formattedBalance >= 10 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {nftBalanceError ? "Error fetching balance" : `${formattedBalance} / 10`}
            </span>
          </div>

          <Button
            className="w-full"
            onClick={handleClaimCro}
            // --- UPDATED: disabled logic ---
            disabled={!canClaim || isClaiming || isClaimed || isCampaignOver}
          >
            {isClaiming ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Claiming...
              </div>
            ) : isCampaignOver ? (
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4" />
                Campaign Ended
              </div>
            ) : isClaimed ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Task Completed
              </div>
            ) : formattedBalance < 10 ? (
              `Claim ${SEND_REWARD_AMOUNT} CRO`
            ) : ( // Only show claim text if eligible and campaign active
              `Claim ${SEND_REWARD_AMOUNT} CRO`
            )}
          </Button>

          {completeMutation.isError && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {completeMutation.error.message}
            </p>
          )}

          {txHash && baseUrl && (
            <div className="text-sm text-center">
              <a
                href={`${baseUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Claim Transaction
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
