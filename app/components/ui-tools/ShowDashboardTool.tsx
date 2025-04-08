import { cronologicalNFTAbi } from "@/abi/cronologicalNFT";
import { Button } from "@/components/ui/button";
import { NFT_CONTRACT_ADDRESS } from "@/constants";
import { Loader2 } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { cronos } from "wagmi/chains";

export default function ShowDashboardTool() {
  const { address, chainId, chain } = useAccount();
  const baseUrl = chain?.blockExplorers?.default.url;

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

  if (!address) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Connect your wallet to view NFT balance</p>
      </div>
    );
  }

  // Loading state
  if (nftBalanceLoading) {
    return (
      <div className="flex items-center justify-center p-4">
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
              Your NFT collection
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Your NFT Balance
            </span>
            <span className={`text-sm font-bold ${formattedBalance >= 10 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {nftBalanceError ? "Error fetching balance" : `${formattedBalance} NFTs`}
            </span>
          </div>

          <Button
            className="w-full"
            disabled={true}
          >
            View Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
