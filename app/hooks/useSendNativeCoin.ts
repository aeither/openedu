import { useEffect, useRef } from 'react';
import { parseEther } from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt, useAccount } from 'wagmi';

export function useSendNativeCoinTool() {
    const { chain } = useAccount();
    const nativeCurrency = chain?.nativeCurrency?.symbol || 'ETH';
    
    const {
        data: txHash,
        error: sendError,
        isPending: isSending,
        sendTransaction
    } = useSendTransaction();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });
    
    // Use a ref to store the callback function
    const onConfirmedRef = useRef<((result: string) => void) | null>(null);
    
    // Watch for confirmation status changes
    useEffect(() => {
        if (isConfirmed && txHash && onConfirmedRef.current) {
            // Transaction is confirmed, call the callback with confirmation details
            const confirmationResult = JSON.stringify({
                success: true,
                confirmed: true,
                message: `${nativeCurrency} sent successfully!`,
                txHash: txHash,
            });
            
            onConfirmedRef.current(confirmationResult);
        }
    }, [isConfirmed, txHash, nativeCurrency]);

    async function handleSendNativeCoin(params: any, onConfirmed?: (result: string) => void): Promise<string> {
        console.log(`Sending ${nativeCurrency}...`, params);
        
        // Store the callback for later use in the effect
        if (onConfirmed) {
            onConfirmedRef.current = onConfirmed;
        }

        const { amount, recipientAddress } = params;
        
        try {
            if (!amount || !recipientAddress) {
                throw new Error("Amount and recipient address are required");
            }
            
            // Send the transaction
            sendTransaction({
                to: recipientAddress,
                value: parseEther(amount.toString()),
            });

            return JSON.stringify({
                success: true,
                pending: true,
                message: `Transaction initiated to send ${amount} ${nativeCurrency} to ${recipientAddress}`,
                txHash: txHash,
                isConfirming,
                isConfirmed
            });
        } catch (e) {
            console.error(`Send ${nativeCurrency} error:`, e);
            return JSON.stringify({
                success: false,
                error: e instanceof Error ? e.message : String(e),
                message: `Failed to send ${nativeCurrency}`
            });
        }
    }

    return { 
        handleSendNativeCoin, 
        isSending, 
        sendError, 
        isConfirming, 
        isConfirmed 
    };
}
