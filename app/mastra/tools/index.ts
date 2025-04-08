import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getPublicClient } from "@/lib/publicClient";
import { formatEther } from "viem";
import { getTokenPrice } from "@/lib/coingecko";
import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';

// Tool for minting an NFT with custom metadata
export const mintNftTool = createTool({
  id: 'mintNftTool',
  description: 'Mint a new Cronological NFT',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Status of the tool execution')
  }),
  execute: async ({ context }) => {
    return {
      status: 'Confirm transaction in your wallet'
    }
  }
});

// Tool for sending native currency to an address
export const sendNativeCoinTool = createTool({
  id: 'sendNativeCoinTool',
  description: 'Send native tokens (ETH, RBTC, etc.) to a specified address',
  inputSchema: z.object({
    amount: z.number().positive().describe('Amount of native currency to send'),
    recipientAddress: z.string().describe('Recipient wallet address'),
  }),
  execute: async ({ context }) => {
    return {
      status: 'Confirm transaction in your wallet'
    }
  }
});

// Tool for checking wallet balance
export const checkBalanceTool = createTool({
  id: 'checkBalanceTool',
  description: 'Check CRO and token balances for a wallet address',
  inputSchema: z.object({
    address: z.string().describe('Wallet address to check'),
    chainId: z.number().describe('Chain ID (25 for Cronos)')
  }),
  outputSchema: z.object({
    address: z.string().describe('The wallet address checked'),
    balance: z.string().describe('Balance in CRO/ETH'),
    symbol: z.string().describe('Token symbol (CRO/ETH)'),
    chainId: z.number().describe('Chain ID')
  }),
  execute: async ({ context }) => {
    const { address, chainId } = context;
    
    if (!address) {
      throw new Error("Address is required");
    }

    const publicClient = getPublicClient(chainId);
    const balance = await publicClient.getBalance({ 
      address: address as `0x${string}`,
    });

    return {
      address,
      balance: formatEther(balance),
      symbol: publicClient.chain.nativeCurrency.symbol,
      chainId
    };
  }
});

// Tool for getting token prices
export const getTokenPriceTool = createTool({
  id: 'getTokenPriceTool',
  description: 'Get the current price of any token in various currencies',
  inputSchema: z.object({
    tokenId: z.string().describe('CoinGecko token ID (e.g., "bitcoin", "ethereum", "cronos")'),
    currency: z.string().default('USD').describe('Currency to convert to (default: USD)')
  }),
  outputSchema: z.object({
    price: z.number().describe('Current token price'),
    currency: z.string().describe('Currency of the price'),
    change24h: z.number().describe('24-hour price change percentage'),
    marketCap: z.number().describe('Market capitalization'),
    volume24h: z.number().describe('24-hour trading volume'),
    lastUpdated: z.string().describe('Timestamp of last update')
  }),
  execute: async ({ context }) => {
    return await getTokenPrice(context.tokenId, context.currency);
  }
});

// Tool for showing the dashboard interface
export const showDashboardTool = createTool({
  id: 'showDashboardTool',
  description: 'Show the user dashboard interface',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Show the user dashboard interface and complete')
  }),
  execute: async () => {
    // This tool is UI-only, so we just return a success status
    return {
      status: 'tool called successfully'
    };
  }
});

// Tool for showing the finance dashboard interface with balances
export const financeDashboardTool = createTool({
  id: 'financeDashboardTool',
  description: 'Show the user finance dashboard with token balance, native balance, and invested amount',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Show the finance dashboard interface and complete')
  }),
  execute: async () => {
    // This tool is UI-only, so we just return a success status
    return {
      status: 'tool called successfully'
    };
  }
});

// Tool for swapping tokens
export const swapTool = createTool({
  id: 'swapTool',
  description: 'Swap WEDU tokens for USDC using Sailfish DEX',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Show the token swap interface and complete')
  }),
  execute: async () => {
    // This tool is UI-only, so we just return a success status
    return {
      status: 'token swap tool called successfully'
    };
  }
});

// Tool for generating educational quizzes
export const generateQuizTool = createTool({
  id: 'generateQuizTool',
  description: 'Generate educational quiz questions on a specified topic',
  inputSchema: z.object({
    topic: z.string().describe('The educational topic to generate quiz questions about'),
    count: z.number().optional().default(4).describe('Number of questions to generate (default: 4)')
  }),
  outputSchema: z.object({
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      answer: z.enum(["A", "B", "C", "D"]),
      explanation: z.string()
    })).describe('Array of generated quiz questions')
  }),
  execute: async ({ context }) => {
    // Access input directly from context
    const { topic, count = 4 } = context;
    
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content:
            "You are a teacher. Your job is to take a document, and create a multiple choice test (with 4 questions) based on the content of the document. Each option should be roughly equal in length. For each question, also include a brief explanation of why the correct answer is correct.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Create a multiple choice test based on this text:\n\n${topic}`,
            },
          ],
        },
      ],
      output: 'array',
      schema: z.object({
        question: z.string(),
        options: z
          .array(z.string())
          .length(4)
          .describe(
            "Four possible answers to the question. Only one should be correct. They should all be of equal lengths.",
          ),
        answer: z
          .enum(["A", "B", "C", "D"])
          .describe(
            "The correct answer, where A is the first option, B is the second, and so on.",
          ),
        explanation: z
          .string()
          .describe(
            "A brief explanation of why the correct answer is correct."
          ),
      }),
    });
    
    return {
      questions: result.object.slice(0, count)
    };
  }
});