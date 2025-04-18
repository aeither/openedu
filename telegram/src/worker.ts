import { createBot } from "./bot";
import { webhookCallback } from "grammy/web";

export interface Env {
  BOT_TOKEN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    const bot = createBot(env.BOT_TOKEN);
    const handleUpdate = webhookCallback(bot, "cloudflare-mod");
    return handleUpdate(request);
  },
};
