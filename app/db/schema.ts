import { boolean, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Define the users table
export const users = pgTable("users", {
  address: text("address").primaryKey().notNull(), // Ethereum address as the primary key
});

// Define the tasks table
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().notNull(), // Task ID (can be UUID or other unique identifier)
  userAddress: text("user_address")
    .notNull()
    .references(() => users.address, { onDelete: "cascade" }), // Foreign key to users table
  taskName: text("task_name").notNull(), // Name of the task
  completed: boolean("completed").default(false).notNull(), // Tracks task completion status
});

// Define the campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Campaign = typeof campaigns.$inferSelect;
