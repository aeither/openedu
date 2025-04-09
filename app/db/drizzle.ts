import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
import * as schema from './schema';
const { Pool } = pkg;
config({ path: ".env" }); // or .env.local

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
});

export const db = drizzle(pool, { schema });
