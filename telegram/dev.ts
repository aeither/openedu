import { createBot } from "./src/bot";
import "dotenv/config";

const bot = createBot(process.env.BOT_TOKEN!);

// Start polling in development
if (process.env.NODE_ENV === "development") {
  console.log("🚀 Starting bot in development mode (polling)");
  bot.start();
}
