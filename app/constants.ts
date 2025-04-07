// Blockchain contract addresses by chain
import { rootstockTestnet, flowTestnet, celoAlfajores } from 'wagmi/chains';
import { useAccount, useChainId } from 'wagmi';

// Default NFT contract address (same across chains)
export const NFT_CONTRACT_ADDRESS = "0xc0Fa47fAD733524291617F341257A97b79488ecE";

// Define contract address interface
interface ChainAddresses {
  TOKEN_ADDRESS: string;
  MONEYMARKET_ADDRESS: string;
}

// Chain-specific contract addresses with proper typing
export const CONTRACT_ADDRESSES: Record<number, ChainAddresses> = {
  // Rootstock chain
  [rootstockTestnet.id]: {
    TOKEN_ADDRESS: "0xc0Fa47fAD733524291617F341257A97b79488ecE",
    MONEYMARKET_ADDRESS: "0xdED87fD6213A8f4ea824B8c74128fAf3DE65BFFE",
  },
  // Flow Testnet
  [flowTestnet.id]: {
    TOKEN_ADDRESS: "0xd9f48b508ba813d128500f0e058574067e9e3abc",
    MONEYMARKET_ADDRESS: "0x177eb648130d9da710807b5ea4ecdbca96ab281e",
  },
  // Celo Alfajores
  [celoAlfajores.id]: {
    TOKEN_ADDRESS: "0xd9f48b508ba813d128500f0e058574067e9e3abc",
    MONEYMARKET_ADDRESS: "0x177eb648130d9da710807b5ea4ecdbca96ab281e",
  },
};

// Default chain ID (Flow Testnet)
export const DEFAULT_CHAIN_ID = flowTestnet.id;

// Function to get contract addresses by chain ID (can be used server-side)
export function getContractAddressesByChainId(chainId: number) {
  const addresses = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID];
  
  return {
    NFT_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ADDRESS: addresses.TOKEN_ADDRESS,
    MONEYMARKET_CONTRACT_ADDRESS: addresses.MONEYMARKET_ADDRESS,
  };
}

// Client-side hook to get contract addresses based on current chain
export function useContractAddresses() {
  const chainId = useChainId();
  const { chain } = useAccount();
  
  // Default to Flow Testnet if chain is not supported
  const activeChainId = chainId || chain?.id || DEFAULT_CHAIN_ID;
  
  return getContractAddressesByChainId(activeChainId);
}

// Legacy constants (maintained for backward compatibility)
// For server-side rendering, these are the default values (Flow Testnet)
export const TOKEN_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID].TOKEN_ADDRESS;
export const MONEYMARKET_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID].MONEYMARKET_ADDRESS;

// Add other global constants here as needed
export const SEND_REWARD_AMOUNT = "2"
