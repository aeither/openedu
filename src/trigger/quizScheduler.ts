import { db } from '@/db/drizzle';
import { notes, quizzes, schedulers } from '@/db/schema';
import { generateBreakdownTool, generateDailyQuizTool } from '@/mastra/tools';
import { configure, schemaTask, wait } from "@trigger.dev/sdk/v3";
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

// Check for secret key during initialization
const triggerSecretKey = process.env.TRIGGER_SECRET_KEY;
if (!triggerSecretKey) {
  throw new Error("Missing environment variable: TRIGGER_SECRET_KEY");
}

// Initialize Trigger.dev client
configure({
  secretKey: triggerSecretKey,
});

// Helper function to get base URL based on environment (copied from webhook)
const getBaseUrl = () =>
  process.env.NODE_ENV === 'development'
    ? 'https://basically-enough-clam.ngrok-free.app' // Ensure this is your correct ngrok URL or dev URL
    : 'https://openedu.dailywiser.xyz'; // Ensure this is your correct production URL

// Define a type for Telegram message data
interface TelegramMessageData {
  chat_id: string;
  text: string;
  reply_markup?: { inline_keyboard: { text: string; url: string }[][] };
}

// Helper function to send Telegram message (copied from webhook)
async function sendTelegramMessage(chatId: string, text: string, quizUrl?: string) {
  const messageData: TelegramMessageData = {
    chat_id: chatId, // Use original chatId for Telegram API
    text
  };

  // Always check if quizUrl is defined and non-empty
  if (quizUrl && quizUrl.trim() !== "") {
    messageData.reply_markup = {
      inline_keyboard: [
        [{ text: "Take Quiz", url: quizUrl }]
      ]
    };
  } else if (quizUrl) {
    // If quizUrl is empty string, log a warning
    console.warn("quizUrl provided but empty, not adding button.");
  }

  const resp = await fetch(
    `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    }
  );
  const data = await resp.json();
  if (!resp.ok) {
    console.error('Telegram API error:', data);
    // Don't throw here, allow the trigger task to continue if possible
    // Maybe just log the error and proceed? Decide on desired error handling.
    console.error(`Failed to send Telegram message to ${chatId}: ${data.description || 'Unknown error'}`);
  }
}

// Schema for scheduled quiz task
export const scheduledQuizTask = schemaTask({
  schema: z.object({
    chatId: z.string(),
    content: z.string(),
    days: z.number(),
    currentDay: z.number(),
  }),
  id: 'scheduled-quiz-task',
  run: async (payload): Promise<{ success: boolean; quizId?: string; message?: string }> => {
    const userAddress = `telegram:${payload.chatId}`; // Use prefixed address for DB interactions

    try {
      // 1. Find the user (optional, but good practice)
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.address, userAddress)
      });

      if (!user) {
        console.error(`User not found for address: ${userAddress}. Skipping quiz generation for day ${payload.currentDay}.`);
        // Decide if the task should fail or just skip this day
        // If skipping, we might still want to schedule the next day if applicable
        // For now, let's proceed to potentially schedule next day
      }

      // 2. Find the relevant scheduler entry & update its current day/status
      let scheduler = await db.query.schedulers.findFirst({
          // Query by userAddress and the *original* content of the series
          where: (s, { eq, and }) => and(
              eq(s.userAddress, userAddress),
              eq(s.content, payload.content) // Match based on the overall series content
              // Consider adding status='running' if you only want to update active ones
          )
      });

      if (!scheduler) {
          console.warn(`Scheduler not found for user ${userAddress} and content "${payload.content}". Attempting to recreate...`);
          try {
            // Re-generate breakdown if needed
            const breakdownRes = await generateBreakdownTool.execute?.({ context: { content: payload.content, totalDays: payload.days } }) || { breakdown: [] };
            const newSchedulerId = uuidv4();
            
            // Attempt to insert the missing scheduler record
            await db.insert(schedulers).values({
              id: newSchedulerId,
              userAddress: userAddress,
              // triggerRunningId: null, // Cannot retrieve original handle ID during re-run
              currentDay: payload.currentDay, // Start from the current day of the payload
              totalDays: payload.days,
              content: payload.content,
              breakdown: breakdownRes.breakdown,
              status: 'running', // Assume it should be running
              createdAt: new Date() // Set creation date to now
            });

            console.log(`Recreated scheduler ${newSchedulerId} for user ${userAddress}`);

            // Re-query to get the newly created scheduler
            scheduler = await db.query.schedulers.findFirst({ where: eq(schedulers.id, newSchedulerId) });

            if (!scheduler) {
              // If still not found after creation attempt, something went wrong
              throw new Error("Failed to retrieve scheduler immediately after recreation.");
            }

          } catch (recreationError: unknown) { // Type the caught error as unknown
            // Check if it's an Error instance before accessing message
            const errorMessage = recreationError instanceof Error ? recreationError.message : "Unknown error during recreation";
            console.error(`Failed to recreate scheduler for user ${userAddress}:`, errorMessage, recreationError);
            return { success: false, message: `Scheduler not found and failed to recreate: ${errorMessage}` };
          }
      }

      // Update scheduler's current day and status (using the found or recreated scheduler)
      const isCompleted = payload.currentDay >= payload.days;
      await db.update(schedulers)
          .set({
              currentDay: payload.currentDay,
              status: isCompleted ? "completed" : "running"
          })
          .where(eq(schedulers.id, scheduler.id));

      if (isCompleted) {
          console.log(`Quiz series complete in trigger task. Marked scheduler ${scheduler.id} as completed`);
          // Don't generate quiz for the final day if status is now completed? Or generate final quiz THEN mark completed?
          // Current logic generates the quiz for payload.currentDay, then marks completed if currentDay >= days.
      }

      // 3. Determine the topic for *this* day's quiz from the breakdown
      const topics = Array.isArray(scheduler.breakdown) && scheduler.breakdown.length > 0
          ? scheduler.breakdown
          : [payload.content]; // Fallback to overall content if breakdown missing
      const topicForToday = topics[payload.currentDay - 1] ?? payload.content; // Use today's topic or fallback

      // 4. Create Note entry (ensure userAddress is prefixed)
      const noteId = uuidv4();
      await db.insert(notes).values({
          id: noteId,
          userAddress: userAddress, // Use prefixed address
          content: `Quiz Topic: ${topicForToday}`, // Content for the note
          createdAt: new Date(),
          updatedAt: new Date(),
      });

      // 5. Generate Quiz Data using the specific topic for today
      const quizDataResult = await generateDailyQuizTool.execute?.({
          context: { topic: topicForToday, count: 4 } // Use topicForToday
      }) || { questions: [] };

      if (!quizDataResult || !Array.isArray(quizDataResult.questions) || quizDataResult.questions.length === 0) {
        console.error(`Failed to generate quiz questions for topic "${topicForToday}" for user ${userAddress}.`);
        // Decide how to handle - skip sending message? Send error message?
        // Let's skip sending quiz but still schedule next day if applicable
      } else {
        // 6. Create Quiz entry
        const quizId = uuidv4();
        await db.insert(quizzes).values({
            id: quizId,
            noteId: noteId, // Link to the note created above
            quizData: quizDataResult,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log(`Generated quiz ${quizId} for user ${userAddress}, day ${payload.currentDay}, topic "${topicForToday}"`);

        // 7. Send Telegram Message with Quiz Link
        const quizUrl = `${getBaseUrl()}/quiz/${quizId}`;
        let text;
        if (isCompleted) {
          text = `🎉 Final Quiz (Day ${payload.currentDay}/${payload.days}) on "${topicForToday}"! Click the button below to complete your journey:`;
        } else {
          text = `📚 Day ${payload.currentDay}/${payload.days} Quiz on "${topicForToday}" is ready! Click the button below to start:`;
        }
        await sendTelegramMessage(payload.chatId, text, quizUrl); // Use original chatId for TG API
      }

      // 8. Schedule the next run if not completed
      if (!isCompleted) {
        // Schedule next day's quiz (after 24 hours)
        // await wait.for({ seconds: 10 }); // Reduced to 10 seconds for testing
        await wait.for({ seconds: 86400 }); // 24 hours in seconds

        // Trigger the next quiz in sequence
        await scheduledQuizTask.trigger({
          chatId: payload.chatId,
          content: payload.content, // Pass original series content
          days: payload.days,
          currentDay: payload.currentDay + 1,
        });
        console.log(`Scheduled next quiz (Day ${payload.currentDay + 1}) for user ${userAddress}`);
      }

      return { success: true, quizId: isCompleted ? undefined : 'scheduled_next' }; // Indicate success or next scheduling

    } catch (error: unknown) { // Explicitly type error as unknown
      console.error(
        `Error in scheduledQuizTask for user ${userAddress}, day ${payload.currentDay}:`,
        error instanceof Error ? error.message : "Unknown error in task run", 
        error // Log the original error object too
      );
      // Consider retries or specific error handling based on error type
      // Returning failure might trigger Trigger.dev's retry policy if configured
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error in task run" 
      };
    }
  },
});
