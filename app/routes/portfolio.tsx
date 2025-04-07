import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, ArrowDownUp, ArrowUpRight, ArrowDownRight, Calendar, Filter } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtocolBadge from '@/components/common/ProtocolBadge';
import { useAccount, useReadContract, useBlockNumber } from 'wagmi';
import { formatUnits } from 'viem';
import { tokenAbi } from '@/abi/tokenABI';
import { moneymarketAbi } from '@/abi/moneymarketABI';
import { useContractAddresses } from '@/constants';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/portfolio')({
  component: RouteComponent,
})

const RISK_LEVELS = [
  { level: 1, label: "Conservative", color: "#D1FAE5" },
  { level: 2, label: "Moderately Conservative", color: "#A7F3D0" },
  { level: 3, label: "Moderate", color: "#6EE7B7" },
  { level: 4, label: "Moderately Aggressive", color: "#34D399" },
  { level: 5, label: "Aggressive", color: "#10B981" }
];

// Protocol configuration - this will be updated with chain-specific addresses
function RouteComponent() {
  const [currentRiskLevel, setCurrentRiskLevel] = React.useState(3);
  const [pieData, setPieData] = useState<Array<{ name: string, value: number, color: string }>>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { TOKEN_CONTRACT_ADDRESS, MONEYMARKET_CONTRACT_ADDRESS } = useContractAddresses();

  // Update PROTOCOLS with chain-specific addresses
  const PROTOCOLS = useMemo(() => [
    { name: 'Curve', color: '#8B5CF6', address: MONEYMARKET_CONTRACT_ADDRESS },
    { name: 'Aave', color: '#0EA5E9', address: MONEYMARKET_CONTRACT_ADDRESS },
    { name: 'Compound', color: '#10B981', address: MONEYMARKET_CONTRACT_ADDRESS },
    { name: 'Uniswap', color: '#F97316', address: MONEYMARKET_CONTRACT_ADDRESS },
  ], [MONEYMARKET_CONTRACT_ADDRESS]);

  // Read token balance
  const { data: tokenBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  // Read money market deposits for the user
  const { data: userDeposits } = useReadContract({
    address: MONEYMARKET_CONTRACT_ADDRESS as `0x${string}`,
    abi: moneymarketAbi,
    functionName: 'deposits',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  // Read total deposits in the protocol
  const { data: totalDeposits } = useReadContract({
    address: MONEYMARKET_CONTRACT_ADDRESS as `0x${string}`,
    abi: moneymarketAbi,
    functionName: 'totalDeposits',
    query: {
      enabled: !!address,
    }
  });

  // Read interest earned
  const { data: interestEarned } = useReadContract({
    address: MONEYMARKET_CONTRACT_ADDRESS as `0x${string}`,
    abi: moneymarketAbi,
    functionName: 'calculateInterest',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  // Update portfolio data when contract data changes
  useEffect(() => {
    if (tokenBalance && userDeposits && totalDeposits) {
      const balance = Number(formatUnits(tokenBalance as bigint, 18));
      const deposits = Number(formatUnits(userDeposits as bigint, 18));
      // Calculate total portfolio value
      const totalValue = balance + deposits;
      setTotalPortfolioValue(totalValue);

      // Calculate protocol allocations (simplified for demo)
      // In a real app, you would query multiple protocols
      const protocolAllocation = [
        { name: 'Curve', value: Math.round((deposits * 0.4) / totalValue * 100), color: '#8B5CF6' },
        { name: 'Aave', value: Math.round((deposits * 0.3) / totalValue * 100), color: '#0EA5E9' },
        { name: 'Compound', value: Math.round((deposits * 0.2) / totalValue * 100), color: '#10B981' },
        { name: 'Uniswap', value: Math.round((deposits * 0.1) / totalValue * 100), color: '#F97316' },
      ];

      setPieData(protocolAllocation.filter(item => item.value > 0));
      setIsLoading(false);
    }
  }, [tokenBalance, userDeposits, totalDeposits, blockNumber]);

  // Generate transaction history based on blockchain data
  useEffect(() => {
    // Always set transactions regardless of interestEarned
    if (address) {
      // Try to get the interest value, use default if not available
      const interest = interestEarned ? Number(formatUnits(interestEarned as bigint, 18)) : 1.25;

      // Build transaction history
      // In a real app, you would fetch this from an indexer or event logs
      const mockTransactions = [
        {
          type: 'roundup',
          title: 'Round-up Investment',
          merchant: 'Starbucks',
          protocol: 'Curve',
          amount: 0.70,
          date: '2 hours ago',
          isPositive: true
        },
        {
          type: 'interest',
          title: 'Interest Earned',
          protocol: 'Aave',
          amount: interest,
          date: 'Yesterday',
          isPositive: true
        },
        {
          type: 'roundup',
          title: 'Round-up Investment',
          merchant: 'Uber',
          protocol: 'Aave',
          amount: 0.15,
          date: 'Yesterday',
          isPositive: true
        },
        {
          type: 'rebalance',
          title: 'Portfolio Rebalance',
          fromProtocol: 'Compound',
          toProtocol: 'Curve',
          amount: 10.0,
          date: 'Apr 3',
          isPositive: false
        },
        {
          type: 'roundup',
          title: 'Round-up Investment',
          merchant: 'Amazon',
          protocol: 'Compound',
          amount: 0.50,
          date: 'Apr 3',
          isPositive: true
        }
      ];

      setTransactions(mockTransactions);
    }
  }, [address, interestEarned, blockNumber]);

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/">
            <ArrowLeft className="text-acorn-dark" />
          </Link>
          <h1 className="text-xl font-bold text-acorn-dark">Portfolio</h1>
        </div>

        <div className="acorn-card bg-gradient-to-br from-acorn-purple/5 to-acorn-blue/5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-acorn-dark">Total Balance</h2>
            <span className="text-xs text-acorn-gray">Updated 5 min ago</span>
          </div>

          <div className="text-center py-3">
            {isLoading || !isConnected ? (
              <Skeleton className="h-9 w-32 mx-auto mb-2" />
            ) : (
              <h2 className="text-3xl font-bold mb-2">${totalPortfolioValue.toFixed(2)}</h2>
            )}
            <div className="inline-flex items-center gap-1 bg-acorn-success/10 text-acorn-success rounded-full px-2 py-0.5 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              <span>
                {userDeposits ? `$${parseFloat(formatUnits(userDeposits as bigint, 18)).toFixed(2)} invested in DeFi` : 'No DeFi investments yet'}
              </span>
            </div>
          </div>

          <div className="flex justify-center h-52">
            {isLoading || !isConnected || pieData.length === 0 ? (
              <div className="flex items-center justify-center w-full h-full">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {isLoading || !isConnected ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))
            ) : (
              pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs text-acorn-dark">{entry.name}: {entry.value}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="acorn-card space-y-4">
          <h2 className="text-lg font-semibold text-acorn-dark">Risk Level: {currentRiskLevel}</h2>
          <p className="text-sm text-acorn-gray">{RISK_LEVELS[currentRiskLevel - 1].label}</p>

          <div className="flex w-full h-2 mb-2 rounded-full overflow-hidden">
            {RISK_LEVELS.map((level, index) => (
              <div
                key={index}
                className="h-full"
                style={{
                  backgroundColor: level.color,
                  width: '20%',
                  opacity: currentRiskLevel >= level.level ? 1 : 0.3
                }}
              />
            ))}
          </div>

          <input
            type="range"
            min={1}
            max={5}
            value={currentRiskLevel}
            onChange={(e) => setCurrentRiskLevel(parseInt(e.target.value))}
            className="w-full accent-acorn-success"
          />

          <div className="flex justify-between text-xs text-acorn-gray">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-acorn-dark">Transaction History</h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Filter className="w-4 h-4 text-acorn-dark" />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-acorn-dark" />
              </button>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="roundups">Round-ups</TabsTrigger>
              <TabsTrigger value="interest">Interest</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-3">
              {isLoading || !isConnected ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <div key={index} className="acorn-card flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.isPositive ? 'bg-acorn-success/10' : 'bg-acorn-warning/10'}`}>
                        {transaction.isPositive ?
                          <ArrowUpRight className={`h-5 w-5 ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`} /> :
                          <ArrowDownRight className={`h-5 w-5 ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`} />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-acorn-dark">{transaction.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {transaction.merchant && <span className="text-xs text-acorn-gray">{transaction.merchant}</span>}
                          {transaction.protocol && <ProtocolBadge name={transaction.protocol} />}
                          {transaction.fromProtocol && (
                            <div className="flex items-center gap-1">
                              <ProtocolBadge name={transaction.fromProtocol} />
                              <ArrowDownUp className="w-3 h-3 text-acorn-gray" />
                              <ProtocolBadge name={transaction.toProtocol} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`}>
                        {transaction.isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-acorn-gray">{transaction.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-acorn-gray">No transactions found</div>
              )}
            </TabsContent>

            <TabsContent value="roundups" className="space-y-3 mt-3">
              {isLoading || !isConnected ? (
                Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : transactions.filter(t => t.type === 'roundup').length > 0 ? (
                transactions.filter(t => t.type === 'roundup').map((transaction, index) => (
                  <div key={index} className="acorn-card flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.isPositive ? 'bg-acorn-success/10' : 'bg-acorn-warning/10'}`}>
                        {transaction.isPositive ?
                          <ArrowUpRight className={`h-5 w-5 ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`} /> :
                          <ArrowDownRight className={`h-5 w-5 ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`} />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-acorn-dark">{transaction.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {transaction.merchant && <span className="text-xs text-acorn-gray">{transaction.merchant}</span>}
                          {transaction.protocol && <ProtocolBadge name={transaction.protocol} />}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`}>
                        {transaction.isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-acorn-gray">{transaction.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-acorn-gray">No round-up transactions found</div>
              )}
            </TabsContent>

            <TabsContent value="interest" className="space-y-3 mt-3">
              {isLoading || !isConnected ? (
                <Skeleton className="h-20 w-full" />
              ) : transactions.filter(t => t.type === 'interest').length > 0 ? (
                transactions.filter(t => t.type === 'interest').map((transaction, index) => (
                  <div key={index} className="acorn-card flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.isPositive ? 'bg-acorn-success/10' : 'bg-acorn-warning/10'}`}>
                        {transaction.isPositive ?
                          <ArrowUpRight className={`h-5 w-5 ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`} /> :
                          <ArrowDownRight className={`h-5 w-5 ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`} />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-acorn-dark">{transaction.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {transaction.protocol && <ProtocolBadge name={transaction.protocol} />}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.isPositive ? 'text-acorn-success' : 'text-acorn-warning'}`}>
                        {transaction.isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-acorn-gray">{transaction.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-acorn-gray">No interest transactions found</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};
