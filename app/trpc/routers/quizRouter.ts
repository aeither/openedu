import { z } from "zod";
import { generateQuizTool } from "../../mastra/tools";
import { createTRPCRouter, publicProcedure } from "../init";

// Schema for quiz generation request
const generateQuizSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  count: z.number().int().min(1).max(10).default(4)
});

export const quizRouter = createTRPCRouter({
  generateQuiz: publicProcedure
    .input(generateQuizSchema)
    .mutation(async ({ input }) => {
      const { topic, count } = input;

      // Check if the tool is available
      if (!generateQuizTool || typeof generateQuizTool.execute !== 'function') {
        throw new Error('Quiz generation tool is not available');
      }

      try {
        // Generate quiz using the tool
        const quizResponse = await generateQuizTool.execute({
          context: {
            topic,
            count
          }
        });

        return quizResponse;
      } catch (error) {
        console.error('Error generating quiz:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to generate quiz');
      }
    }),
});
