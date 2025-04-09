import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useChainId, useConnect, useWriteContract, useSwitchChain, useTransaction } from "wagmi";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// ABI for the ED3 Yuzu Buddies contract (just the mint function)
const YUBU_ABI = [
  {
    "inputs": [
      {
        "name": "arg0",
        "type": "address"
      },
      {
        "name": "arg1",
        "type": "uint256"
      },
      {
        "name": "arg2",
        "type": "uint256"
      },
      {
        "name": "arg3",
        "type": "bytes"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract address for the Yuzu Buddies
const YUBU_CONTRACT_ADDRESS = "0x153d7e04Cdc4423B42a4407274C9D1f94a2720c5";

// NFT Images for selection
const YUBU_IMAGES = [
  {
    id: 1,
    name: "Yubu #1",
    imageUrl: "https://ipfs.filebase.io/ipfs/bafybeiacb2kfe56pykrw2yg7oqurxf5x4oes6qwvxz52w54rchajs5qzfi",
  },
  {
    id: 2,
    name: "Yubu #2",
    imageUrl: "https://ipfs.filebase.io/ipfs/bafybeib6br37ikabncmozbbvvne6372qtos6bp75nvscroesyfoq6rkbqi",
  },
  {
    id: 3,
    name: "Yubu #3",
    imageUrl: "https://ipfs.filebase.io/ipfs/bafybeiaah5he2don6yn7tylw26nfyex72adjkir4pqby3ltdazmldjsg5m",
  },
  {
    id: 4,
    name: "Yubu #4",
    imageUrl: "https://ipfs.filebase.io/ipfs/bafybeiacsz6hyumtcotvbzz2tp7icdxgsdjirkjhlmskdpsor34t77dzoa",
  },
];

export default function YuzuBuddiesMinterTool() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isMinting, setIsMinting] = useState(false);
  const [selectedNft, setSelectedNft] = useState<number | null>(null);

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
    if (!isConnected || !address || selectedNft === null) return;
    
    setIsMinting(true);
    try {
      await writeContractAsync({
        abi: YUBU_ABI,
        address: YUBU_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'mint',
        args: [address, BigInt(selectedNft), BigInt(1), "0x"],
      });
      // The txData will be updated via the hook, which triggers the useEffect
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yuzu Buddies (Yubu) Minter</CardTitle>
        <CardDescription>Choose and mint your free Yuzu Buddy NFT from ED3</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {YUBU_IMAGES.map((nft) => (
            <div 
              key={nft.id}
              className={`
                relative aspect-square overflow-hidden rounded-lg cursor-pointer
                transition-all duration-200 transform hover:scale-105
                ${selectedNft === nft.id ? 'ring-4 ring-primary ring-offset-2' : 'ring-1 ring-muted'}
              `}
              onClick={() => setSelectedNft(nft.id)}
            >
              <img 
                src={nft.imageUrl} 
                alt={nft.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-white text-sm font-medium">{nft.name}</p>
              </div>
              {selectedNft === nft.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground">Selection: {selectedNft ? `Yubu #${selectedNft}` : "No selection"}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <Button
            className="w-full"
            onClick={handleMint}
            disabled={isPending || isMinting || selectedNft === null}
          >
            {isPending || isMinting ? "Minting..." : "Mint Selected Yubu"}
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
