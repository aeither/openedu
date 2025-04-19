import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { TRPCError } from '@trpc/server';
import { groq } from '@ai-sdk/groq';
import { generateObject } from "ai";

export const aiRouter = createTRPCRouter({
  evaluateMessage: publicProcedure
    .input(z.object({ 
      chatId: z.string(), 
      message: z.string() 
    }))
    .mutation(async ({ input }) => {
      try {
        // Evaluate if the message is about creating quizzes with scheduling
        const { object } = await generateObject({
          model: groq('qwen-qwq-32b'),
          output: 'object',
          schema: z.object({
            intent: z.enum(['quiz_scheduling', 'quiz_now', 'general']),
            content: z.string().describe('The educational content to create quiz on'),
            days: z.number().optional().describe('Number of days to schedule quizzes for, if applicable'),
          }),
          prompt: input.message,
          system: `You are an AI assistant that categorizes user messages into intents.

Your task is to determine if a message is requesting:
1. A scheduled quiz series (quiz_scheduling) - Example: "create quizzes about the discovery of America for the next 7 days"
2. An immediate quiz (quiz_now) - Example: "quiz me about photosynthesis"
3. A general query (general) - Example: "how are you?" or any other general conversation

If the intent is quiz_scheduling or quiz_now, extract the educational content they want to be quizzed on.
If the intent is quiz_scheduling, also extract the number of days they want quizzes for.

Be precise in your classification. Only categorize as quiz_scheduling if there's a clear indication of wanting periodic quizzes over time.`,
        });

        return {
          intent: object.intent,
          content: object.content,
          days: object.days
        };
      } catch (error) {
        console.error('Error evaluating message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to evaluate message',
        });
      }
    }),
});
