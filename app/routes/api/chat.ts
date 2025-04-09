import { mastra } from '@/mastra';
import { groq } from '@ai-sdk/groq';
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { generateObject } from "ai";

export const APIRoute = createAPIFileRoute('/api/chat')({
    GET: ({ request, params }) => {
        return json({ message: 'Hello "/api/chat"!' })
    },
    POST: async ({ request, params }) => {
        const { messages } = await request.json();

        // Extract the last user message to determine the appropriate agent
        const lastUserMessage = messages[messages.length - 1].content;
        const { object } = await generateObject({
            model: groq('qwen-qwq-32b'),
            output: 'enum',
            enum: ['default', 'show'],
            prompt: lastUserMessage,
            system: `You are a planning assistant that determines which specialized agent would be most helpful for a user's query.
    
    Based on the user's request, you must decide which of the following predefined agent types would be most appropriate:
    - "default": For general questions, explanations, and regular assistance
    - "show": For requests that require showing UI components, visualizations, or interactive interfaces
    
    Examples of "show" requests:
    - "Show me my dashboard"
    - "I want to create a quiz"
    - "Generate a quiz from my notes"
    - "Help me swap tokens"
    - "I want to mint an NFT"
    - "Show me my wallet balance"
    
    Your response should ONLY be a single string containing the most appropriate agent type: "show" or "default".
    Do not include any other text in your response.`,
        });
        console.log("Agent: ", object)

        // if (object === 'crypto') {
        //     const myAgent = mastra.getAgent('cryptoToolsAgent');
        //     const stream = await myAgent.stream(lastUserMessage);
        //     return stream.toDataStreamResponse({ sendReasoning: false });
        // }
        if (object === 'show') {
            const myAgent = mastra.getAgent('uiToolAgent');
            // Only send the last message to avoid loops
            const stream = await myAgent.stream(lastUserMessage, { maxSteps: 1 });
            return stream.toDataStreamResponse({ sendReasoning: false });
        }
        if (object === 'default') {
            const myAgent = mastra.getAgent('defaultAgent');
            const stream = await myAgent.stream(messages);
            return stream.toDataStreamResponse({ sendReasoning: false });
        }
        const myAgent = mastra.getAgent('defaultAgent');
        const stream = await myAgent.stream(messages);
        return stream.toDataStreamResponse({ sendReasoning: false });
    },
});
