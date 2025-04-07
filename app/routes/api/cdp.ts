import { groq } from '@ai-sdk/groq';
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { generateObject, streamText } from "ai";
import {
  AgentKit,
  cdpApiActionProvider,
  erc721ActionProvider,
  walletActionProvider,
  SmartWalletProvider,
} from "@coinbase/agentkit";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import * as dotenv from "dotenv";
import { getVercelAITools } from "@coinbase/agentkit-vercel-ai-sdk";
dotenv.config();

export const APIRoute = createAPIFileRoute('/api/cdp')({
  POST: async ({ request }) => {
    try {
      // Parse incoming request
      const { messages } = await request.json();
      const lastMessage = messages[messages.length - 1].content;

      // Determine agent type based on user input
      const { object: agentType } = await generateObject({
        model: groq('qwen-qwq-32b'),
        output: 'enum',
        enum: ['wallet', 'nft', 'default'],
        prompt: lastMessage,
        system: `Determine the appropriate CDP agent type:
- "wallet": For wallet operations (balances, transactions)
- "nft": For NFT-related actions (minting, transfers)
- "default": For general queries`,
      });

      console.log("Determined Agent Type:", agentType);

      // Initialize the CDP AgentKit
      const networkId = process.env.NETWORK_ID || "base-sepolia";
      const privateKey = process.env.ADMIN_PRIVATE_KEY || generatePrivateKey();
      const signer = privateKeyToAccount(privateKey as `0x${string}`);

      const walletProvider = await SmartWalletProvider.configureWithWallet({
        networkId,
        signer,
        paymasterUrl: undefined, // Optional Paymaster URL for sponsored transactions
      });

      const agentKit = await AgentKit.from({
        walletProvider,
        actionProviders: [
          cdpApiActionProvider({
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
          }),
          erc721ActionProvider(),
          walletActionProvider(),
        ],
      });
      
      // Process user input based on determined agent type
      if (agentType === 'wallet') {
        const tools = getVercelAITools(agentKit);
        const stream = streamText({
          model: groq('qwen-qwq-32b'),
          messages,
          tools,
          system: `You are a wallet assistant. Handle wallet-related queries.`,
          maxSteps: 5,
        });
        return stream.toDataStreamResponse();
      }

      if (agentType === 'nft') {
        const tools = getVercelAITools(agentKit);
        const stream = streamText({
          model: groq('qwen-qwq-32b'),
          messages,
          tools,
          system: `You are an NFT assistant. Handle NFT-related queries.`,
          maxSteps: 5,
        });
        return stream.toDataStreamResponse();
      }

      // Default fallback for general queries
      return json({ message: "This query is not supported by the CDP agent." });
    } catch (error) {
      console.error("Error in /api/cdp:", error);
      return json({ error: "Failed to process the request" }, { status: 500 });
    }
  },
});
