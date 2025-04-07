import { tokenAbi } from "@/abi/tokenABI";
import { moneymarketAbi } from "@/abi/moneymarketABI";
import { Card } from "@/components/ui/card";
import { useContractAddresses } from "@/constants";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function FinanceDashboardTool() {
  const { address, chain, isConnected } = useAccount();
  const { TOKEN_CONTRACT_ADDRESS, MONEYMARKET_CONTRACT_ADDRESS } = useContractAddresses();
  const [totalValue, setTotalValue] = useState<number>(0);

  // Fetch native token balance (ETH, BNB, etc.)
  const { 
    data: nativeBalance,
    isLoading: isNativeBalanceLoading
  } = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: !!address,
    }
  });

  // Fetch ERC20 token balance
  const { 
    data: tokenBalance,
    isLoading: isTokenBalanceLoading 
  } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!TOKEN_CONTRACT_ADDRESS,
    }
  });

  // Fetch money market deposits (invested amount)
  const { 
    data: userDeposits,
    isLoading: isDepositsLoading 
  } = useReadContract({
    address: MONEYMARKET_CONTRACT_ADDRESS as `0x${string}`,
    abi: moneymarketAbi,
    functionName: 'deposits',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!MONEYMARKET_CONTRACT_ADDRESS,
    }
  });

  // Calculate total value when data is loaded
  useEffect(() => {
    if (tokenBalance && userDeposits) {
      const tokenValue = Number(formatUnits(tokenBalance as bigint, 18));
      const depositsValue = Number(formatUnits(userDeposits as bigint, 18));
      setTotalValue(tokenValue + depositsValue);
    }
  }, [tokenBalance, userDeposits]);

  // Loading state
  const isLoading = isNativeBalanceLoading || isTokenBalanceLoading || isDepositsLoading;

  // Format balances
  const formattedNativeBalance = nativeBalance 
    ? Number(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4) 
    : "0.0000";
  
  const formattedTokenBalance = tokenBalance 
    ? Number(formatUnits(tokenBalance as bigint, 18)).toFixed(2) 
    : "0.00";

  const formattedDeposits = userDeposits 
    ? Number(formatUnits(userDeposits as bigint, 18)).toFixed(2) 
    : "0.00";

  if (!isConnected) {
    return (
      <Card className="bg-secondary/50 rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Financial Dashboard
          </h2>
          <p className="text-muted-foreground">
            Connect your wallet to view your balances
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl p-6 space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-primary">
          Financial Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Your current balances and investments
        </p>
      </div>

      <div className="space-y-5">
        {/* Total Value */}
        <div className="text-center">
          {isLoading ? (
            <Skeleton className="h-9 w-36 mx-auto mb-2" />
          ) : (
            <div className="space-y-1">
              <h3 className="text-sm text-muted-foreground">Total Value</h3>
              <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Native Balance */}
          <div className="bg-background rounded-xl p-4 border border-border/50">
            {isNativeBalanceLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <h3 className="text-xs text-muted-foreground">Native Balance</h3>
                <p className="text-lg font-semibold">{formattedNativeBalance}</p>
                <p className="text-xs text-muted-foreground">{nativeBalance?.symbol || chain?.nativeCurrency.symbol}</p>
              </div>
            )}
          </div>

          {/* Token Balance */}
          <div className="bg-background rounded-xl p-4 border border-border/50">
            {isTokenBalanceLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <h3 className="text-xs text-muted-foreground">Token Balance</h3>
                <p className="text-lg font-semibold">${formattedTokenBalance}</p>
              </div>
            )}
          </div>

          {/* Invested Amount */}
          <div className="bg-background rounded-xl p-4 border border-border/50">
            {isDepositsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <h3 className="text-xs text-muted-foreground">Invested Amount</h3>
                <p className="text-lg font-semibold">${formattedDeposits}</p>
                <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 rounded-full px-2 py-0.5 text-xs">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>In DeFi</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-center text-muted-foreground pt-2">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </Card>
  );
}
