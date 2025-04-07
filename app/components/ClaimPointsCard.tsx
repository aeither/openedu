import { Button } from "@/components/ui/button";
import { useMintNftTool } from "@/hooks/useMintNft";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";

interface ClaimPointsCardProps {
  points?: number;
}

export function ClaimPointsCard({ points = 100 }: ClaimPointsCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { handleMintNft } = useMintNftTool();
  const { address } = useAccount();

  const handleClaim = async () => {
    setIsClaiming(true);
    
    try {
      // Call the mint NFT function with claim points data
      const mintResult = await handleMintNft(
        {
          to: address,
        },
        (confirmationResult) => {
          // This will be called when the transaction is confirmed
          const parsedResult = JSON.parse(confirmationResult);
          setResult(parsedResult.message || "Points claimed successfully!");
          setIsClaimed(true);
          setIsClaiming(false);
        }
      );
      
      // Update UI with pending state
      const parsed = JSON.parse(mintResult);
      setResult(parsed.message || "Transaction pending...");
      
    } catch (error) {
      setResult("Failed to claim points. Please try again.");
      setIsClaiming(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 my-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-zinc-100">
            {isClaimed ? "Points Claimed" : "Claim Point"}
          </h3>
          {result && (
            <p className="text-xs text-emerald-400 mt-1">
              {result}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isClaiming || isClaimed}
          onClick={handleClaim}
          className={`ml-2 ${isClaimed ? "bg-emerald-900/20 border-emerald-800" : ""}`}
        >
          {isClaiming ? (
            <span className="flex items-center">
              Processing...
            </span>
          ) : isClaimed ? (
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Claimed
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Claim Now
              <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
