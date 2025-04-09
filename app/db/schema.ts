import { integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Define the users table
export const users = pgTable("users", {
  address: text("address").primaryKey(),
  lastActive: timestamp("last_active", { withTimezone: true }),
  totalCredits: numeric("total_credits").default("0"),
  xp: numeric("xp").default("0"),
});

// Define the notes table
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey(),
  userAddress: text("user_address")
    .notNull()
    .references(() => users.address, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Define the quizzes table - now with JSON data
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  quizData: jsonb("quiz_data").notNull(), // Using jsonb for better JSON storage and querying
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Define the flashcards table - now linked to notes
export const flashcards = pgTable("flashcards", {
  id: uuid("id").primaryKey(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  deckName: text("deck_name").notNull(),
  lastReviewed: timestamp("last_reviewed", { withTimezone: true }),
  nextReviewDue: timestamp("next_review_due", { withTimezone: true }),
  difficultyLevel: integer("difficulty_level").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Export types for TypeScript inference
export type User = typeof users.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
