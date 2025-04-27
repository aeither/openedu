import { getTokenPrice } from "@/lib/coingecko";
import { getPublicClient } from "@/lib/publicClient";
import { groq } from '@ai-sdk/groq';
import { createTool } from '@mastra/core/tools';
import { generateObject } from 'ai';
import { formatEther } from "viem";
import { z } from 'zod';

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
  description: 'Show the finance dashboard with balances and transactions',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Status of the tool execution')
  }),
  async execute() {
    return {
      status: 'Finance dashboard displayed',
      ui: 'ShowDashboardTool'
    }
  }
});

// Tool for swapping tokens
export const swapTool = createTool({
  id: 'swapTool',
  description: 'Swap tokens using built-in DEX function',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Status of the tool execution')
  }),
  async execute() {
    return {
      status: 'Swap interface displayed',
      ui: 'SwapTool'
    }
  }
});

// Tool for minting Grasp Academy NFT
export const graspAcademyNFTTool = createTool({
  id: 'graspAcademyNFTTool',
  description: 'Mint an educational NFT from Grasp Academy which represents proof of learning achievement',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Status of the tool execution')
  }),
  async execute() {
    return {
      status: 'Grasp Academy NFT minting interface displayed',
      ui: 'GraspAcademyNFTTool'
    }
  }
});

// Tool for minting Yuzu Buddies NFT
export const yuzuBuddiesMinterTool = createTool({
  id: 'yuzuBuddiesMinterTool',
  description: 'Mint free Yuzu Buddies (Yubu) NFTs - choose from 4 different characters',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Status of the tool execution')
  }),
  async execute() {
    return {
      status: 'Yuzu Buddies minting interface displayed',
      ui: 'YuzuBuddiesMinterTool'
    }
  }
});

// add a tool for showing quiz gen ui
export const quizGeneratorUITool = createTool({
  id: 'quizGeneratorUITool',
  description: 'Shows an interface for generating educational quizzes',
  inputSchema: z.object({}),
  outputSchema: z.object({
    status: z.string().describe('Status of the tool execution')
  }),
  execute: async () => {
    return {
      status: 'Quiz generator interface ready'
    }
  }
});

// Tool for generating educational quizzes
export const generateQuizTool = createTool({
  id: 'generateQuizTool',
  description: 'Generate educational quiz questions based on provided content',
  inputSchema: z.object({
    content: z.string().describe('The educational content to generate quiz questions from'),
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
    const { content, count = 4 } = context;
    
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
          content: `Create ${count} multiple choice quiz questions based on the following content:\n\n${content}`
        }
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

// Tool to break down content into daily subtopics
export const generateBreakdownTool = createTool({
  id: 'generateBreakdownTool',
  description: 'Break down content into subtopics for each day',
  inputSchema: z.object({
    content: z.string().describe('Full content to split'),
    totalDays: z.number().describe('Number of days')
  }),
  outputSchema: z.object({
    breakdown: z.array(z.string()).describe('Array of daily subtopics')
  }),
  execute: async ({ context }) => {
    const { content, totalDays } = context;
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        { role: 'system', content: 'You are a teacher. Break down the following content into the specified number of subtopics, one per day.' },
        { role: 'user', content: `Break down this content into ${totalDays} subtopics for daily lessons:\n\n${content}` }
      ],
      output: 'array',
      schema: z.string().describe('Daily subtopic')
    });
    return { breakdown: result.object.slice(0, totalDays) };
  }
});

// Schema for a single quiz question
const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4).describe('Four possible answers'),
  answer: z.enum(["A","B","C","D"]).describe('Correct answer'),
  explanation: z.string().describe('Explanation for correct answer')
});

// Tool to generate a quiz for a specific daily subtopic
export const generateDailyQuizTool = createTool({
  id: 'generateDailyQuizTool',
  description: 'Generate a multiple choice quiz for a given subtopic',
  inputSchema: z.object({
    topic: z.string().describe('Subtopic to quiz'),
    count: z.number().optional().default(4).describe('Number of questions')
  }),
  outputSchema: z.object({
    questions: z.array(questionSchema).describe('Array of generated quiz questions')
  }),
  execute: async ({ context }) => {
    const { topic, count = 4 } = context;
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        { role: 'system', content: 'You are a teacher. Create a multiple choice quiz based on the following subtopic, ensuring equal-length options and explanations.' },
        { role: 'user', content: `Generate ${count} multiple choice questions for this subtopic:\n\n${topic}` }
      ],
      output: 'array',
      schema: questionSchema
    });
    return { questions: result.object.slice(0, count) };
  }
});

// Tool for generating flashcards
export const generateFlashcardTool = createTool({
  id: 'generateFlashcardTool',
  description: 'Generate educational flashcards based on provided content',
  inputSchema: z.object({
    content: z.string().describe('The educational content to generate flashcards from'),
    count: z.number().optional().default(5).describe('Number of flashcards to generate (default: 5)')
  }),
  outputSchema: z.object({
    flashcards: z.array(z.object({
      front: z.string().describe('Question or concept on the front side of the flashcard'),
      back: z.string().describe('Answer or explanation on the back side of the flashcard')
    })).describe('Array of generated flashcards')
  }),
  execute: async ({ context }) => {
    // Access input directly from context
    const { content, count = 5 } = context;
    
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content:
            "You are an education expert. Your job is to take educational content and create helpful flashcards that capture key concepts, definitions, or important facts from the material. Each flashcard should have a clear front (question/concept) and back (answer/explanation).",
        },
        {
          role: "user",
          content: `Create ${count} educational flashcards based on the following content:\n\n${content}`
        }
      ],
      output: 'array',
      schema: z.object({
        front: z.string().describe('Question or concept on the front side of the flashcard'),
        back: z.string().describe('Answer or explanation on the back side of the flashcard')
      }),
    });
    
    return {
      flashcards: result.object.slice(0, count)
    };
  }
});

// Tool to describe an image or answer questions within it
export const describeImageTool = createTool({
  id: 'describeImageTool',
  description: 'Analyzes an image from a URL. If it contains a question (math, quiz, etc.), answers it. Otherwise, provides a concise description.',
  inputSchema: z.object({
    imageUrl: z.string().url().describe('The URL of the image to analyze')
  }),
  // Updated output schema
  outputSchema: z.object({
    type: z.enum(['answer', 'description']).describe('Whether the response is an answer to a question or a description'),
    content: z.string().describe('The answer to the question or the description of the image')
  }),
  execute: async ({ context }) => {
    const { imageUrl } = context;

    const result = await generateObject({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"), // Or another vision-capable model
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              // Updated prompt instruction
              text: "Analyze the image carefully. First, determine if it primarily contains a question that needs an answer (e.g., a math problem, a quiz question, a request for help or information presented visually). If it IS a question, provide a helpful answer or solution and set type to 'answer'. If it is NOT primarily a question, provide a concise description of the image content and set type to 'description'."
            },
            { type: "image", image: new URL(imageUrl) },
          ],
        },
      ],
      // Use the updated schema for the output
      schema: z.object({
        type: z.enum(['answer', 'description']).describe('Whether the response is an answer or a description'),
        content: z.string().describe('The answer or the description')
      })
    });

    // Return the structured object
    return {
      type: result.object.type,
      content: result.object.content
    };
  }
});
