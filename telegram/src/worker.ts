import { webhookCallback } from "grammy/web";
import { createBot } from "./bot";

export interface Env {
  BOT_TOKEN: string;
  BOT_TOKEN_DEV?: string;
  GROQ_API_KEY: string;
  NODE_ENV: string;
}

// Define the production API URL
const PRODUCTION_API_URL = "https://openedu.dailywiser.xyz";

export default {
  async fetch(
    request: Request,
    env: Env, // Env contains secrets like BOT_TOKEN
  ): Promise<Response> {
    try {
      // Determine API URL (Use env.API_URL if set, otherwise default to production)
      // const apiBaseUrl = env.API_URL || PRODUCTION_API_URL; 
      const apiBaseUrl = PRODUCTION_API_URL; // Simpler: Assume production in worker

      // Pass BOT_TOKEN, the determined apiBaseUrl, and the env object
      const bot = createBot(env.BOT_TOKEN, apiBaseUrl, env);

      bot.catch((err) => {
        console.error('Error caught by bot.catch:', err);
      });

      const handleUpdate = webhookCallback(bot, "cloudflare-mod");
      return handleUpdate(request);

    } catch (e) {
      console.error("Critical error during request processing setup:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
