import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env" })

// Ensure DATABASE_URL is defined
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required")
}
export default defineConfig({
  schema: "./app/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
})
