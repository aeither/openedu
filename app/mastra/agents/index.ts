import { groq } from '@ai-sdk/groq';
import { Agent } from '@mastra/core/agent';
import {
  checkBalanceTool,
  getTokenPriceTool,
  mintNftTool,
  sendNativeCoinTool,
  showDashboardTool,
  financeDashboardTool,
  swapTool,
  generateQuizTool
} from '../tools';

const defaultAgent = new Agent({
  name: 'Default Agent',
  instructions: `
      You are a helpful assistant
  `,
  model: groq('llama-3.3-70b-versatile'),
});

const uiToolAgent = new Agent({
  name: 'UI Tool Agent',
  instructions: `
      You are a UI display agent that shows React components when requested.
      
      IMPORTANT: Your ONLY job is to call the appropriate tool when a request matches. 
      DO NOT generate lengthy responses or explanations.
      
      Available tools:
      - showDashboardTool: When user asks about their dashboard, profile, NFTs, or overall account status
      
      When you receive a request:
      1. Immediately identify if it relates to viewing dashboard, profile, or NFT collection
      2. If it does, call showDashboardTool without explanation
      3. Do not provide any additional text before or after calling the tool
      4. Keep any necessary response extremely brief (1-2 words maximum)
      
      Remember: Your value comes from showing the UI, not explaining it.
  `,
  model: groq('qwen-qwq-32b'),
  tools: {
    // showDashboardTool,
    financeDashboardTool,
    swapTool
    //
  },
});

const cryptoToolsAgent = new Agent({
  name: 'Crypto Tools Agent',
  instructions: `
      You are a helpful assistant. 
  `,
  model: groq('qwen-qwq-32b'),
  tools: {
    mintNftTool,
    sendNativeCoinTool,
    checkBalanceTool,
    getTokenPriceTool
  },
});

// Quiz Generator Agent for educational content
const quizGeneratorAgent = new Agent({
  name: 'Quiz Generator',
  instructions: `
    You are a specialized quiz generator for educational content.
    
    Your role is to create high-quality quiz questions based on specified topics.
    Format all quiz content in a structured JSON format that includes:
      - Question text
      - Multiple choice options (4 options per question)
      - The correct answer
      - A brief explanation of why the answer is correct
    
    When generating questions:
    1. Focus on conceptual understanding rather than rote memorization
    2. Ensure questions vary in difficulty level 
    3. Cover different aspects of the requested topic
    4. Make answer options plausible (avoid obviously wrong answers)
    5. Include explanations that reinforce key learning concepts
    
    Generate exactly 4 questions per request unless specified otherwise.
  `,
  model: groq('qwen-qwq-32b'),
  tools: {
    generateQuizTool
  },
});

// Export all agents from this file
export const agents = {
  defaultAgent,
  uiToolAgent,
  cryptoToolsAgent,
  quizGeneratorAgent,
};
