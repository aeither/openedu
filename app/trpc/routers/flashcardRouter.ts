import { z } from "zod";
import { generateFlashcardTool } from "../../mastra/tools";
import { createTRPCRouter, publicProcedure } from "../init";
import { db } from "@/db/drizzle";
import { notes, flashcards } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from 'uuid';

// Schema for flashcard generation request
const generateFlashcardSchema = z.object({
  content: z.string().min(1, "Content is required"),
  count: z.number().int().min(1).max(20).default(8),
  userAddress: z.string().min(1, "User address is required")
});

export const flashcardRouter = createTRPCRouter({
  generateFlashcards: publicProcedure
    .input(generateFlashcardSchema)
    .mutation(async ({ input }) => {
      const { content, count, userAddress } = input;

      // Check if the tool is available
      if (!generateFlashcardTool || typeof generateFlashcardTool.execute !== 'function') {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Flashcard generation tool is not available"
        });
      }

      try {
        // Generate flashcards using the tool
        const flashcardResponse = await generateFlashcardTool.execute({
          context: {
            content,
            count
          }
        });

        // Create a note in the database
        const noteId = uuidv4();
        await db.insert(notes).values({
          id: noteId,
          userAddress,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create flashcard deck linked to that note
        const deckName = `Deck ${new Date().toLocaleDateString()}`;
        const flashcardIds = [];

        for (const fc of flashcardResponse.flashcards) {
          const flashcardId = uuidv4();
          flashcardIds.push(flashcardId);
          await db.insert(flashcards).values({
            id: flashcardId,
            noteId,
            front: fc.front,
            back: fc.back,
            deckName,
            createdAt: new Date()
          });
        }

        return {
          flashcards: flashcardResponse.flashcards,
          noteId,
          deckName
        };
      } catch (error) {
        console.error('Error generating flashcards:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to generate flashcards'
        });
      }
    }),

  // Get flashcards by deck ID
  getFlashcardsByDeckId: publicProcedure
    .input(z.object({
      deckId: z.string().uuid("Invalid deck ID")
    }))
    .query(async ({ input }) => {
      try {
        const deckFlashcards = await db.query.flashcards.findMany({
          where: (flashcards, { eq }) => eq(flashcards.noteId, input.deckId)
        });

        if (deckFlashcards.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Flashcards not found"
          });
        }

        return {
          flashcards: deckFlashcards.map(fc => ({
            id: fc.id,
            front: fc.front,
            back: fc.back
          })),
          deckName: deckFlashcards[0].deckName
        };
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to fetch flashcards'
        });
      }
    }),
});
