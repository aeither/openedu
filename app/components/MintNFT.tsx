import * as React from 'react';
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi';
import { cronologicalNFTAbi } from '@/abi/cronologicalNFT';
import { SOULBOUND_NFT_ADDRESS } from '@/constants';

export function MintNFT() {
  const { 
    data: hash,
    error,
    isPending, 
    writeContract 
  } = useWriteContract();

  async function handleMint(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault();
    
    writeContract({
      address: SOULBOUND_NFT_ADDRESS as `0x${string}`,
      abi: cronologicalNFTAbi,
      functionName: 'mint',
      // No args needed for this mint function
    });
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Mint Cronological NFT</h3>
      <form onSubmit={handleMint} className="space-y-4">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isPending} 
          type="submit"
        >
          {isPending ? 'Confirming...' : 'Mint NFT'} 
        </button>
        
        <div className="space-y-2 mt-4">
          {hash && (
            <div className="text-sm">
              <span className="font-semibold">Transaction Hash:</span>{' '}
              <span className="font-mono break-all">{hash}</span>
            </div>
          )}
          {isConfirming && <div className="text-yellow-600">Waiting for confirmation...</div>} 
          {isConfirmed && <div className="text-green-600">Transaction confirmed. Your NFT has been minted!</div>} 
          {error && (
            <div className="text-red-600">
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
