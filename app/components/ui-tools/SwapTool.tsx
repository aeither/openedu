"use client";

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useConnect, useSwitchChain } from 'wagmi';
import { Quoter, Router, TradeType, ExactInputSingleParams } from '@sailfishdex/v3-sdk';
import { ethers } from 'ethers';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const WEDU = "0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12";
const USDC = "0x836d275563bAb5E93Fd6Ca62a95dB7065Da94342";

// Sailfish Router address on EDUCHAIN
const ROUTER_ADDRESS = "0x1a1e967e523435CeF20642e3D7811F7d0da9a704";

// EDUCHAIN chain
const EDUCHAIN_ID = 41923;

// ERC20 ABI fragment for approval
const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function SwapTool() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ethersSigner, setEthersSigner] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('');

  // Only show the UI after mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert wagmi state to ethers signer
  useEffect(() => {
    if (
      !mounted ||
      !isConnected ||
      typeof window === "undefined" ||
      !window.ethereum
    ) {
      console.log("Not connected or no window.ethereum");
      setEthersSigner(null);
      return;
    }

    const getSigner = async () => {
      try {
        console.log("Getting signer...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log("Signer obtained:", signer);
        setEthersSigner(signer);
      } catch (error) {
        console.error("Failed to get ethers signer:", error);
        setEthersSigner(null);
      }
    };

    getSigner();
  }, [mounted, isConnected, address, chainId]);

  // Initialize SDK instances with signer when available
  useEffect(() => {
    if (!ethersSigner) {
      console.log("No signer available for SDK initialization");
    }
  }, [ethersSigner]);

  const handleGetQuote = async () => {
    if (!amount || !ethersSigner) return;
    setLoading(true);
    try {
      const provider = ethersSigner.provider;
      const quoter = new Quoter(provider);
      
      const result = await quoter.getQuote(
        WEDU,
        USDC,
        amount,
        '0',
        TradeType.EXACT_INPUT
      );
      console.log("Quote result:", result);
      setQuote(result);
    } catch (error) {
      console.error("Get quote error:", error);
    }
    setLoading(false);
  };

  const approveToken = async () => {
    if (!ethersSigner || !address) return false;
    setApprovalStatus('Approving token...');
    
    try {
      // Using the predefined router address
      const routerAddress = ROUTER_ADDRESS;
      console.log("Router address:", routerAddress);
      
      // Create token contract interface
      const tokenContract = new ethers.Contract(WEDU, ERC20_ABI, ethersSigner);
      
      // Check current allowance
      const allowanceABI = ["function allowance(address owner, address spender) view returns (uint256)"];
      const tokenWithAllowance = new ethers.Contract(WEDU, [...ERC20_ABI, ...allowanceABI], ethersSigner);
      
      try {
        const currentAllowance = await tokenWithAllowance.allowance(address, routerAddress);
        console.log("Current allowance:", currentAllowance.toString());
        
        const amountInWei = ethers.parseEther(amount);
        if (currentAllowance >= amountInWei) {
          console.log("Sufficient allowance already exists");
          setApprovalStatus('Token already approved!');
          return true;
        }
      } catch (error) {
        console.error("Error checking allowance:", error);
      }
      
      // Set a high allowance to allow multiple swaps
      const amountToApprove = ethers.parseEther('1000000'); // Very high allowance
      console.log("Approving amount:", amountToApprove.toString());
      
      // Send approval transaction
      const approveTx = await tokenContract.approve(routerAddress, amountToApprove);
      console.log("Approval transaction submitted:", approveTx.hash);
      
      setApprovalStatus('Waiting for approval confirmation...');
      await approveTx.wait();
      console.log("Approval confirmed");
      setApprovalStatus('Approval successful!');
      return true;
      
    } catch (error) {
      console.error("Token approval error:", error);
      setApprovalStatus('Approval failed. Please try again.');
      return false;
    }
  };

  const handleSwap = async () => {
    if (!quote || !address || !ethersSigner) return;
    setLoading(true);

    try {
      // First approve the token
      const approved = await approveToken();
      if (!approved) {
        setLoading(false);
        return;
      }
      
      console.log("Quote:", quote);
      console.log("Fee tier:", quote.feeTier, typeof quote.feeTier);

      // Extract fee tier as a number
      const feeTier = Number(quote.feeTier);
      console.log("Parsed fee tier:", feeTier, typeof feeTier);

      const router = new Router(ethersSigner);
      const amountInWei = ethers.parseEther(amount);
      const amountOutMin = ethers.parseUnits(quote.amountOut, 6);

      const swapParams = await router.createSwapTransaction(
        WEDU,
        USDC,
        feeTier,  // Use the properly parsed fee tier
        amountInWei,
        amountOutMin,
        TradeType.EXACT_INPUT,
        {
          slippagePercentage: 0.5,
          recipient: address,
        }
      );

      console.log("Swap params:", swapParams);

      // For EXACT_INPUT we need to use exactInputSingle
      const tx = await router.exactInputSingle(swapParams as ExactInputSingleParams);
      console.log('Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed');

    } catch (error) {
      console.error('Swap failed:', error);
    }
    setLoading(false);
  };

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) return null;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Swap Tokens</h2>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">Please connect your wallet to continue</p>
          <div className="flex flex-wrap gap-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                variant="outline"
                size="sm"
              >
                {connector.name}
              </Button>
            ))}
          </div>
        </div>
      ) : chainId !== EDUCHAIN_ID ? (
        <div className="space-y-4">
          <p className="text-destructive">Please switch to EDUCHAIN to use this dApp</p>
          <Button
            onClick={() => switchChain({ chainId: EDUCHAIN_ID })}
            variant="default"
          >
            Switch to EDUCHAIN
          </Button>
        </div>
      ) : !ethersSigner ? (
        <div className="space-y-2">
          <p className="text-muted-foreground">Connecting to your wallet...</p>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount of WEDU"
              className="w-full"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleGetQuote}
            disabled={loading || !amount}
            variant="default"
          >
            {loading ? 'Loading...' : 'Get Quote'}
          </Button>

          {approvalStatus && (
            <div className={`p-3 rounded-md ${
              approvalStatus.includes('failed') 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-primary/10 text-primary'
            }`}>
              {approvalStatus}
            </div>
          )}

          {quote && (
            <div className="space-y-4 bg-secondary/50 p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated Output:</p>
                <p className="font-medium">{quote.amountOut} USDC</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Price Impact:</p>
                <p className="font-medium">{quote.priceImpact}%</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fee Tier:</p>
                <p className="font-medium">
                  {Array.isArray(quote.feeTier) ? quote.feeTier[0] / 10000 : quote.feeTier / 10000}%
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleSwap}
                disabled={loading}
                variant="default"
              >
                {loading ? 'Processing...' : `Swap ${amount} WEDU for ${quote.amountOut} USDC`}
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Powered by{' '}
            <a 
              href="https://sailfish.xyz" 
              className="text-primary hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Sailfish DEX
            </a>
          </p>
        </div>
      )}
    </Card>
  );
}
