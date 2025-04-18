import { logger, schedules, wait, configure, task, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// Initialize Trigger.dev client
configure({
  secretKey: process.env.TRIGGER_SECRET_KEY!,
});

export const firstScheduledTask = schedules.task({
  id: "first-scheduled-task",
  // Every hour
  cron: "0 * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run
    const distanceInMs =
      payload.timestamp.getTime() - (payload.lastTimestamp ?? new Date()).getTime();

    logger.log("First scheduled tasks", { payload, distanceInMs });

    // Wait for 5 seconds
    await wait.for({ seconds: 5 });

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    logger.log(formatted);
  },
});

const API_BASE_URL = "https://openedu.dailywiser.xyz";

// Hello world task example
export const helloWorldTask = schemaTask({
  schema: z.object({
    chatId: z.string(),
    action: z.string(),
    data: z.object({ message: z.string() }),
  }),
  id: 'hello-world-task',
  run: async (payload) => {
    // Wait for 5 seconds before executing
    await wait.for({ seconds: 5 });

    // Call our webhook endpoint
    const url = `${API_BASE_URL}/api/webhook`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: payload.chatId,
        action: payload.action,
        data: payload.data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook call failed with status ${response.status}`);
    }
    return response.json();
  },
});