import { TRPCError } from '@trpc/server';
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
// Import the Trigger.dev task
import { startVideoRenderTask } from "../../../src/trigger/videoRenderer"; // Adjust path if necessary

// Define the URL for the Remotion backend (used by getRenderStatus)
const REMOTION_RENDER_URL = "https://remotion-quiz-be-production.up.railway.app/renders/";

export const videoQuizRouter = createTRPCRouter({
  // New mutation to trigger the background task
  triggerRender: publicProcedure
    .input(z.object({
      chatId: z.string(),
      content: z.string(),
      questionCount: z.number().optional().default(3), // Allow specifying count
    }))
    .mutation(async ({ input }) => {
      try {
        // Trigger the background task asynchronously
        const handle = await startVideoRenderTask.trigger({
          chatId: input.chatId,
          content: input.content,
          questionCount: input.questionCount,
        });
        
        console.log(`Triggered startVideoRenderTask for chatId ${input.chatId}, handle ID: ${handle.id}`);
        
        // Return the handle ID or a simple success status
        return { success: true, triggerHandleId: handle.id };

      } catch (error) {
        console.error('Error triggering startVideoRenderTask:', error);
        // Handle potential errors during the trigger call 
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to trigger video render task.',
        });
      }
    }),

  // Keep the getRenderStatus query as it was
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
          return result;

       } catch (error) {
         console.error('Error in getRenderStatus:', error);
         if (error instanceof TRPCError) throw error; 
         throw new TRPCError({
           code: 'INTERNAL_SERVER_ERROR',
           message: error instanceof Error ? error.message : 'An unexpected error occurred while fetching render status.',
         });
       }
    }),
}); 