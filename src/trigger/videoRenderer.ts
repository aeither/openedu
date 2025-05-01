import { generateVideoQuizDataTool } from '@/mastra/tools';
import { configure, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// Initialize Trigger.dev client (if not already done globally)
// Ensure secret key is available in this environment
const triggerSecretKey = process.env.TRIGGER_SECRET_KEY;
if (!triggerSecretKey) {
  // In production, Trigger.dev might handle this, but good practice for potential local runs
  console.warn("Missing environment variable: TRIGGER_SECRET_KEY for videoRenderer task");
}
configure({
  secretKey: triggerSecretKey || "dummy_key_for_dev", // Provide a dummy key if needed for local testing
});

// Define the URL for the Remotion backend
const REMOTION_RENDER_URL = process.env.REMOTION_RENDER_URL || "https://remotion-quiz-be-production.up.railway.app/renders/";
// Define the Telegram Bot Token (needs to be available to the trigger environment)
const TELEGRAM_BOT_TOKEN = process.env.TG_BOT_TOKEN; // Ensure this is set where the trigger runs

// Helper to send Telegram message directly (avoids needing full bot context)
async function sendTelegramMessage(chatId: string, text: string) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error("TG_BOT_TOKEN is not configured for the Trigger.dev task environment. Cannot send message.");
        return; // Cannot proceed without token
    }
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });
        if (!response.ok) {
            const data = await response.json();
            console.error(`Failed to send Telegram status message to ${chatId}: ${data.description || 'Unknown error'}`);
        }
    } catch (error) {
         console.error(`Network error sending Telegram status message to ${chatId}:`, error);
    }
}


// Task Schema and Definition
export const startVideoRenderTask = schemaTask({
  id: 'start-video-render-task',
  schema: z.object({
    chatId: z.string(),
    content: z.string(),
    questionCount: z.number().optional().default(3),
  }),
  run: async (payload, { ctx }) => {
    console.log(`Starting video render task for chatId: ${payload.chatId}`);
    try {
      // 1. Generate Quiz Data
      if (!generateVideoQuizDataTool?.execute) {
        throw new Error('Video Quiz generation tool is not available in trigger.');
      }
      const quizData = await generateVideoQuizDataTool.execute({
        context: {
          content: payload.content,
          count: payload.questionCount,
        },
      });

      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        throw new Error('Failed to generate quiz data from the provided content.');
      }

      // 2. Prepare payload for Remotion service
      const remotionPayload = {
        chatId: payload.chatId, // Pass chatId along if needed by Remotion backend
        quizData: quizData,
      };

      // 3. POST to Remotion backend
      const response = await fetch(REMOTION_RENDER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(remotionPayload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Remotion render POST failed:", response.status, errorBody);
        throw new Error(`Failed to start video render (Status: ${response.status}). ${errorBody}`);
      }

      const result = await response.json();

      if (!result.jobId) {
        console.error("Remotion response missing jobId:", result);
        throw new Error('Video render started, but did not receive a Job ID.');
      }

      // 4. Send success message back to user via Telegram API
      const successMessage = `✅ Video rendering started!\nJob ID: \`${result.jobId}\`\n\nUse \`/video_status ${result.jobId}\` to check progress.`;
      await sendTelegramMessage(payload.chatId, successMessage);

      console.log(`Successfully started video render job ${result.jobId} for chatId ${payload.chatId}`);
      return { success: true, jobId: result.jobId };

    } catch (error: unknown) {
      console.error(`Error in startVideoRenderTask for chatId ${payload.chatId}:`, error);
      // Send error message back to user
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during video processing.";
      await sendTelegramMessage(payload.chatId, `❌ Failed to start video quiz render. Reason: ${errorMessage}`);
      // Re-throw the error so Trigger.dev marks the run as failed
      throw error;
    }
  },
}); 