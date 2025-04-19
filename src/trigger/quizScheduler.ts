import { schedules, wait, configure, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// Initialize Trigger.dev client
configure({
  secretKey: process.env.TRIGGER_SECRET_KEY!,
});

const API_BASE_URL = "https://openedu.dailywiser.xyz";

// Schema for scheduled quiz task
export const scheduledQuizTask = schemaTask({
  schema: z.object({
    chatId: z.string(),
    content: z.string(),
    days: z.number(),
    currentDay: z.number(),
  }),
  id: 'scheduled-quiz-task',
  run: async (payload): Promise<any> => {
    // Generate and send quiz for the current day
    // Call our webhook endpoint
    const url = `${API_BASE_URL}/api/webhook`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: payload.chatId,
        action: 'generate_quiz',
        data: { 
          message: payload.content,
          day: payload.currentDay,
          totalDays: payload.days
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook call failed with status ${response.status}`);
    }
    
    // If we haven't reached the last day, schedule the next quiz
    if (payload.currentDay < payload.days) {
      // Schedule next day's quiz (after 24 hours)
      await wait.for({ seconds: 86400 }); // 24 hours in seconds
      
      // Trigger the next quiz in sequence
      return scheduledQuizTask.trigger({
        chatId: payload.chatId,
        content: payload.content,
        days: payload.days,
        currentDay: payload.currentDay + 1,
      });
    }
    
    return response.json();
  },
});
