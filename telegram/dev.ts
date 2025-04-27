import "dotenv/config";
import { createBot } from "./src/bot";

// Determine API URL based on environment
const apiBaseUrl = process.env.NODE_ENV === "development"
  ? process.env.DEV_API_URL || "https://basically-enough-clam.ngrok-free.app" // Use env var or default dev URL
  : process.env.PROD_API_URL || "https://openedu.dailywiser.xyz"; // Use env var or default prod URL

// Get Bot Token
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error("Missing BOT_TOKEN environment variable for development");
}

// Create bot instance, passing token and API URL
const bot = createBot(botToken, apiBaseUrl);

// Start polling in development
if (process.env.NODE_ENV === "development") {
  console.log(`🚀 Starting bot in development mode (polling) targeting API: ${apiBaseUrl}`);
  bot.start();
}
