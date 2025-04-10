// Blockchain contract addresses by chain
import { eduChain, eduChainTestnet } from 'wagmi/chains';
import { useAccount, useChainId } from 'wagmi';

// Define contract address interface
interface ChainAddresses {
  SOULBOUND_NFT_ADDRESS: string;
}

// Chain-specific contract addresses with proper typing
export const CONTRACT_ADDRESSES: Record<number, ChainAddresses> = {
  // EDU Chain Mainnet
  [eduChain.id]: {
    SOULBOUND_NFT_ADDRESS: "0x9FF865C0Ee8f3BAe60a58cbc23B24cB8234aeF3A",
  },
  // EDU Chain Testnet
  [eduChainTestnet.id]: {
    SOULBOUND_NFT_ADDRESS: "0x9FF865C0Ee8f3BAe60a58cbc23B24cB8234aeF3A",
  },
};

// Default chain ID (EDU Chain Testnet)
export const DEFAULT_CHAIN_ID = eduChain.id;

// Function to get contract addresses by chain ID (can be used server-side)
export function getContractAddressesByChainId(chainId: number) {
  const addresses = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID];

  return {
    SOULBOUND_NFT_ADDRESS: addresses.SOULBOUND_NFT_ADDRESS,
  };
}

// Client-side hook to get contract addresses based on current chain
export function useContractAddresses() {
  const chainId = useChainId();
  const { chain } = useAccount();

  // Default to EDU Chain Testnet if chain is not supported
  const activeChainId = chainId || chain?.id || DEFAULT_CHAIN_ID;

  return getContractAddressesByChainId(activeChainId);
}

// Legacy constants (maintained for backward compatibility)
// For server-side rendering, these are the default values (EDU Chain Testnet)
export const SOULBOUND_NFT_ADDRESS = CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID].SOULBOUND_NFT_ADDRESS;

// Add other global constants here as needed
export const SEND_REWARD_AMOUNT = "2"
