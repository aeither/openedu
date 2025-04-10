import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useChainId, useConnect, useWriteContract, useSwitchChain, useWatchContractEvent, useTransaction } from "wagmi";
import { useState, useEffect } from "react";
import { parseEther } from "ethers"; 
import { ConnectButton } from "@rainbow-me/rainbowkit";

// ABI for the GraspAcademyNFT contract (just the safeMint function)
const NFT_ABI = [
  {
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "uri",
        "type": "string"
      }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const NFT_CONTRACT_ADDRESS = "0x5155b576356A65C929B14e6bFDE4723299861E5F";
const NFT_URI = "ipfs://QmNMU7pXh53H37qRmxRnqApMRdeHjVrijb2XaB7VUyofrg";
const NFT_IMAGE = "https://ipfs.io/ipfs/Qmd6tSTzsy2M6Z3BpfP1SEJ2Cd7eX5GXzY1DWNaZX4A4X6";
const MINT_COST = "0.0333"; // ETH

export default function GraspAcademyNFTTool() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isMinting, setIsMinting] = useState(false);

  // Contract write hook for minting
  const { writeContractAsync, isPending, data: txData, error: writeError } = useWriteContract();
  
  // Watch for tx data changes
  useEffect(() => {
    if (txData) {
      setTxHash(txData);
    }
  }, [txData]);
  
  // Watch transaction
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useTransaction({
    hash: txHash,
  });

  // Get explorer URL for transaction
  const getExplorerUrl = (hash: string) => {
    if (!chain?.blockExplorers?.default?.url) return '#';
    return `${chain.blockExplorers.default.url}/tx/${hash}`;
  };

  // Handle mint function
  const handleMint = async () => {
    if (!isConnected || !address) return;
    
    setIsMinting(true);
    try {
      await writeContractAsync({
        abi: NFT_ABI,
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'safeMint',
        args: [address, NFT_URI],
        value: parseEther(MINT_COST),
      });
      // The txData will be updated via the hook, which triggers the useEffect
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Grasp Academy NFT</CardTitle>
        <CardDescription>Mint an exclusive educational NFT from Grasp Academy</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-3/4 max-w-[250px] aspect-square mb-4 overflow-hidden rounded-lg mx-auto">
          <img 
            src={NFT_IMAGE} 
            alt="Grasp Academy NFT" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="mb-4 text-center">
          <p className="font-medium">Price: {MINT_COST} EDU</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <Button
            className="w-full"
            onClick={handleMint}
            disabled={isPending || isTxLoading || isMinting}
          >
            {isPending || isTxLoading || isMinting ? "Minting..." : "Mint NFT"}
          </Button>
        )}
        
        {writeError && (
          <p className="text-sm text-red-500">Error: {writeError.message}</p>
        )}
        
        {isTxSuccess && txHash && (
          <p className="text-sm text-green-500">
            Successfully minted! Transaction: {" "}
            <a 
              href={getExplorerUrl(txHash)} 
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-600"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-4)}
            </a>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
