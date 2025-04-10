import { db } from "@/db/drizzle";
import { notes } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

// Schema for note creation
const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  userAddress: z.string().min(1, "User address is required")
});

// Schema for note update
const updateNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID"),
  content: z.string().min(1, "Content is required")
});

export const notesRouter = createTRPCRouter({
  // Get all notes for a user
  getNotesByUser: publicProcedure
    .input(z.object({
      userAddress: z.string().min(1, "User address is required")
    }))
    .query(async ({ input }) => {
      try {
        const userNotes = await db.query.notes.findMany({
          where: (notes, { eq }) => eq(notes.userAddress, input.userAddress),
          orderBy: (notes, { desc }) => [desc(notes.updatedAt)]
        });

        return userNotes.map(note => ({
          id: note.id,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }));
      } catch (error) {
        console.error('Error fetching notes:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to fetch notes'
        });
      }
    }),

  // Get a single note by ID
  getNoteById: publicProcedure
    .input(z.object({
      noteId: z.string().uuid("Invalid note ID")
    }))
    .query(async ({ input }) => {
      try {
        const note = await db.query.notes.findFirst({
          where: (notes, { eq }) => eq(notes.id, input.noteId)
        });

        if (!note) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Note not found"
          });
        }

        // Check if there are quizzes associated with this note
        const quizzes = await db.query.quizzes.findMany({
          where: (quizzes, { eq }) => eq(quizzes.noteId, input.noteId)
        });

        // Check if there are flashcards associated with this note
        const flashcards = await db.query.flashcards.findMany({
          where: (flashcards, { eq }) => eq(flashcards.noteId, input.noteId)
        });

        return {
          id: note.id,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          hasQuiz: quizzes.length > 0,
          quizId: quizzes.length > 0 ? quizzes[0].id : null,
          hasFlashcards: flashcards.length > 0
        };
      } catch (error) {
        console.error('Error fetching note:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to fetch note'
        });
      }
    }),

  // Create a new note
  createNote: publicProcedure
    .input(createNoteSchema)
    .mutation(async ({ input }) => {
      const { content, userAddress } = input;
      const noteId = uuidv4();

      try {
        await db.insert(notes).values({
          id: noteId,
          userAddress,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          id: noteId,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } catch (error) {
        console.error('Error creating note:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to create note'
        });
      }
    }),

  // Update an existing note
  updateNote: publicProcedure
    .input(updateNoteSchema)
    .mutation(async ({ input }) => {
      const { id, content } = input;

      try {
        const note = await db.query.notes.findFirst({
          where: (notes, { eq }) => eq(notes.id, id)
        });

        if (!note) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Note not found"
          });
        }

        await db.update(notes)
          .set({
            content,
            updatedAt: new Date()
          })
          .where(eq(notes.id, id));

        return {
          id,
          content,
          updatedAt: new Date()
        };
      } catch (error) {
        console.error('Error updating note:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to update note'
        });
      }
    }),

  // Delete a note
  deleteNote: publicProcedure
    .input(z.object({
      noteId: z.string().uuid("Invalid note ID")
    }))
    .mutation(async ({ input }) => {
      try {
        const note = await db.query.notes.findFirst({
          where: (notes, { eq }) => eq(notes.id, input.noteId)
        });

        if (!note) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Note not found"
          });
        }

        await db.delete(notes).where(eq(notes.id, input.noteId));

        return { success: true };
      } catch (error) {
        console.error('Error deleting note:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to delete note'
        });
      }
    }),
});
