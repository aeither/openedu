import { useEffect, useRef } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { cronologicalNFTAbi } from "@/abi/cronologicalNFT";
import { NFT_CONTRACT_ADDRESS } from '@/constants';

export function useMintNftTool() {
    const {
        data: mintTxHash,
        error: mintError,
        isPending: isMintPending,
        writeContract: writeNftContract
    } = useWriteContract();

    const {
        isLoading: isMintConfirming,
        isSuccess: isMintConfirmed
    } = useWaitForTransactionReceipt({
        hash: mintTxHash,
    });
    
    // Use a ref to store the callback function
    const onConfirmedRef = useRef<((result: string) => void) | null>(null);
    
    // Watch for confirmation status changes
    useEffect(() => {
        if (isMintConfirmed && mintTxHash && onConfirmedRef.current) {
            // Transaction is confirmed, call the callback with confirmation details
            const confirmationResult = JSON.stringify({
                success: true,
                confirmed: true,
                message: "NFT minted successfully!",
                txHash: mintTxHash,
            });
            
            onConfirmedRef.current(confirmationResult);
        }
    }, [isMintConfirmed, mintTxHash]);

    async function handleMintNft(params: any, onConfirmed?: (result: string) => void): Promise<string> {
        console.log("Minting NFT...", params);
        
        // Store the callback for later use in the effect
        if (onConfirmed) {
            onConfirmedRef.current = onConfirmed;
        }

        try {
            writeNftContract({
                address: NFT_CONTRACT_ADDRESS,
                abi: cronologicalNFTAbi,
                functionName: 'mint',
                args: [params.to],
            });

            return JSON.stringify({
                success: true,
                pending: true,
                message: "NFT minting initiated",
                txHash: mintTxHash,
                isConfirming: isMintConfirming,
                isConfirmed: isMintConfirmed
            });
        } catch (e) {
            console.error("Mint error:", e);
            return JSON.stringify({
                success: false,
                error: e instanceof Error ? e.message : String(e),
                message: "Failed to mint NFT"
            });
        }
    }

    return { handleMintNft, isMintPending, mintError, isMintConfirmed };
}
