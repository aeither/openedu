import { generateVideoQuizDataTool } from "@/mastra/tools";
import { TRPCError } from '@trpc/server';
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

// Define the URL for the Remotion backend
const REMOTION_RENDER_URL = "https://remotion-quiz-be-production.up.railway.app/renders/";

export const videoQuizRouter = createTRPCRouter({
  generateAndStartRender: publicProcedure
    .input(z.object({
      chatId: z.string(),
      content: z.string(),
      questionCount: z.number().optional().default(3), // Allow specifying count
    }))
    .mutation(async ({ input }) => {
      try {
        // 1. Generate Quiz Data - Check if tool/execute exists
        if (!generateVideoQuizDataTool?.execute) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Video Quiz generation tool is not available.',
            });
        }
        const quizData = await generateVideoQuizDataTool.execute({
          context: {
            content: input.content,
            count: input.questionCount,
          },
        });

        if (!quizData || !quizData.questions || quizData.questions.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate quiz data from the provided content.',
          });
        }

        // 2. Prepare payload for Remotion service
        const remotionPayload = {
          chatId: input.chatId, // Pass chatId along
          quizData: quizData, // Use the generated data
        };

        // 3. POST to Remotion backend to start render
        const response = await fetch(REMOTION_RENDER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(remotionPayload),
        });

        if (!response.ok) {
           const errorBody = await response.text(); // Get error details if possible
           console.error("Remotion render POST failed:", response.status, errorBody);
           throw new TRPCError({
             code: 'INTERNAL_SERVER_ERROR',
             message: `Failed to start video render (Status: ${response.status}). ${errorBody}`,
           });
        }

        const result = await response.json();

        if (!result.jobId) {
           console.error("Remotion response missing jobId:", result);
           throw new TRPCError({
             code: 'INTERNAL_SERVER_ERROR',
             message: 'Video render started, but did not receive a Job ID from the render service.',
           });
        }

        // 4. Return the jobId
        return { jobId: result.jobId };

      } catch (error) {
        console.error('Error in generateAndStartRender:', error);
        if (error instanceof TRPCError) throw error; // Re-throw specific TRPC errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
      }
    }),

  getRenderStatus: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
       if (!input.jobId) {
         throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job ID is required.' });
       }
       
       const statusUrl = `${REMOTION_RENDER_URL}${input.jobId}`;
       
       try {
          const response = await fetch(statusUrl, { method: 'GET' });

          if (response.status === 404) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `Render job with ID '${input.jobId}' not found.`,
            });
          }

          if (!response.ok) {
             const errorBody = await response.text();
             console.error("Remotion status GET failed:", response.status, errorBody);
             throw new TRPCError({
               code: 'INTERNAL_SERVER_ERROR',
               message: `Failed to get render status (Status: ${response.status}). ${errorBody}`,
             });
          }

          const result = await response.json();
          // Return the status object directly (e.g., { status: 'in-progress', progress: 0.7 } or { status: 'done', url: '...' })
          return result;

       } catch (error) {
         console.error('Error in getRenderStatus:', error);
         if (error instanceof TRPCError) throw error; // Re-throw specific TRPC errors
         throw new TRPCError({
           code: 'INTERNAL_SERVER_ERROR',
           message: error instanceof Error ? error.message : 'An unexpected error occurred while fetching render status.',
         });
       }
    }),
}); 