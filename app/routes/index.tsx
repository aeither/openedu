import ProtocolBadge from '@/components/common/ProtocolBadge';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, CreditCard, GraduationCap, Plus, TrendingUp } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEffect, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { tokenAbi } from '@/abi/tokenABI';
import { toast } from 'sonner';
import { useContractAddresses } from '@/constants';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { TOKEN_CONTRACT_ADDRESS } = useContractAddresses();

  // Read token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  // Contract write for minting new tokens
  const { writeContract: mintTokens, isPending: isMinting, data: mintTxHash } = useWriteContract();
  
  // Transaction receipt tracking
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt(
    txHash ? {
      hash: txHash as `0x${string}`,
    } : { hash: undefined }
  );
  
  // Update txHash when mint transaction is submitted
  useEffect(() => {
    if (mintTxHash) {
      setTxHash(mintTxHash);
    }
  }, [mintTxHash]);
  
  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success("Successfully minted 100 EURS tokens!");
      refetchBalance();
      setTxHash(null);
      setIsLoading(false);
    }
  }, [isConfirmed, txHash, refetchBalance]);

  // Format and set balance when tokenBalance changes
  useEffect(() => {
    if (tokenBalance) {
      const formattedBalance = formatUnits(tokenBalance as bigint, 18);
      setBalance(formattedBalance);
    } else if (!address) {
      setBalance('0');
    }
  }, [tokenBalance, address]);

  // Handle minting 100 tokens
  const handleAddFunds = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      await mintTokens({
        address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
        abi: tokenAbi,
        functionName: 'mint',
        args: [parseUnits('100', 18)],
      });
      
      // Toast and balance refresh will happen in the confirmation effect
      toast("Transaction submitted. Waiting for confirmation...");
    } catch (error) {
      console.error("Error minting tokens:", error);
      toast.error("Failed to mint tokens. Please try again.");
      setIsLoading(false);
    }
  };

  const latestTransactions = [
    { 
      merchant: 'Starbucks', 
      amount: 4.30, 
      roundUp: 0.70, 
      protocol: 'Curve', 
      date: '2 hours ago',
      icon: '☕️'
    },
    { 
      merchant: 'Uber', 
      amount: 19.85, 
      roundUp: 0.15, 
      protocol: 'Aave', 
      date: 'Yesterday',
      icon: '🚗'
    },
    { 
      merchant: 'Amazon', 
      amount: 28.50, 
      roundUp: 0.50, 
      protocol: 'Compound', 
      date: 'Apr 3',
      icon: '📦'
    }
  ];

  return (
    <AppLayout title="Good morning" subtitle="April 5, 2025">
      <div className="p-4 space-y-6">
        <div className="acorn-card bg-gradient-to-br from-primary/80 to-primary/40 border-0 text-white p-5">
          <p className="text-white/80 mb-1">Portfolio Balance</p>
          <h2 className="text-3xl font-bold mb-3">
            {isConnected ? `${parseFloat(balance).toFixed(0)} EURS` : "Connect wallet to view"}
          </h2>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+0.3% this month</span>
          </div>
          <div className="flex gap-3 mt-5">
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-lg bg-white/20 text-white border-0 hover:bg-white/30"
              onClick={handleAddFunds}
              disabled={isLoading || !isConnected || isMinting || isConfirming}
            >
              <Plus className="w-4 h-4 mr-1" /> 
              {isConfirming ? "Confirming..." : isLoading || isMinting ? "Minting..." : "Add Funds"}
            </Button>
            <Link to="/portfolio">
              <Button variant="secondary" size="sm" className="rounded-lg bg-white/20 text-white border-0 hover:bg-white/30">
                Details
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Recent Round-ups</h2>
          <Link to="/portfolio" className="text-primary text-sm font-medium flex items-center">
            View all <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        <div className="space-y-3">
          {latestTransactions.map((transaction, index) => (
            <div key={index} className="acorn-card flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/60 rounded-full flex items-center justify-center text-xl">
                  {transaction.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{transaction.merchant}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">-${transaction.amount.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-xs text-primary">+${transaction.roundUp.toFixed(2)}</p>
                  <ProtocolBadge name={transaction.protocol} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/earn" className="acorn-card bg-gradient-to-br from-secondary/50 to-secondary/30 border border-secondary/50">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Earn Cashback</h3>
            <p className="text-xs text-muted-foreground mt-1">Shop and earn crypto</p>
          </Link>
          <Link to="/learn" className="acorn-card bg-gradient-to-br from-secondary/50 to-secondary/30 border border-secondary/50">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Learn</h3>
            <p className="text-xs text-muted-foreground mt-1">DeFi education</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};
