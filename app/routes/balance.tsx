import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from '@tanstack/react-router';
import { checkBalanceTool } from '@/mastra/tools';

// Define the response type from the balance API
interface BalanceResponse {
  address: string;
  balance: string;
  symbol: string;
  chainId: string | number;
}

export const Route = createFileRoute('/balance')({
  component: BalancePage,
});

function BalancePage() {
  // Get account and chain info from wagmi
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // State to store the balance data and loading state
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the balance data
  const fetchBalance = async () => {
    if (!address || !chainId) {
      setError('Wallet not connected or chain ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use optional chaining to safely access the execute method
      if (!checkBalanceTool || !checkBalanceTool.execute) {
        throw new Error('Failed to fetch balance data');
      }
      const result = await checkBalanceTool.execute({
        context: {
          address,
          chainId
        }
      });

      if (!result) {
        throw new Error('Failed to fetch balance data');
      }

      // Set the result as the balance data
      setBalanceData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the balance number for display
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Wallet Balance</h1>
      
      {!isConnected ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold">Please connect your wallet</h3>
            <p className="text-muted-foreground">Connect your wallet to check your balance</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold">Connected Address:</p>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{address}</code>
                </div>
                <div>
                  <p className="font-semibold">Chain ID:</p>
                  <Badge variant="outline">{chainId}</Badge>
                </div>
                <Separator />
                <Button 
                  onClick={fetchBalance} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Fetching...' : 'Check Balance'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-4/5 mb-2" />
                <Skeleton className="h-5 w-3/5" />
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-500">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {balanceData && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Address:</p>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{balanceData.address}</code>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Balance:</p>
                    <p className="text-2xl font-bold">
                      {formatBalance(balanceData.balance)} {balanceData.symbol}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Chain ID:</p>
                    <Badge variant="outline">{balanceData.chainId}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
