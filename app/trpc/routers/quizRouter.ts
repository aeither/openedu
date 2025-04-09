import { z } from "zod";
import { generateQuizTool } from "../../mastra/tools";
import { createTRPCRouter, publicProcedure } from "../init";
import { db } from "@/db/drizzle";
import { notes, quizzes } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from 'uuid';

// Schema for quiz generation request
const generateQuizSchema = z.object({
  content: z.string().min(1, "Content is required"),
  count: z.number().int().min(1).max(10).default(4),
  userAddress: z.string().min(1, "User address is required")
});

export const quizRouter = createTRPCRouter({
  generateQuiz: publicProcedure
    .input(generateQuizSchema)
    .mutation(async ({ input }) => {
      const { content, count, userAddress } = input;

      // Check if the tool is available
      if (!generateQuizTool || typeof generateQuizTool.execute !== 'function') {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Quiz generation tool is not available"
        });
      }

      try {
        // Generate quiz using the tool
        const quizResponse = await generateQuizTool.execute({
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

        // Create a quiz linked to that note
        const quizId = uuidv4();
        await db.insert(quizzes).values({
          id: quizId,
          noteId,
          quizData: quizResponse,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          ...quizResponse,
          quizId,
          noteId
        };
      } catch (error) {
        console.error('Error generating quiz:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to generate quiz'
        });
      }
    }),

  // Get a quiz by ID
  getQuizById: publicProcedure
    .input(z.object({
      quizId: z.string().uuid("Invalid quiz ID")
    }))
    .query(async ({ input }) => {
      try {
        const quiz = await db.query.quizzes.findFirst({
          where: (quizzes, { eq }) => eq(quizzes.id, input.quizId),
          with: {
            note: true
          }
        });

        if (!quiz) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz not found"
          });
        }

        return {
          quizData: quiz.quizData,
          noteContent: quiz.note.content,
          quizId: quiz.id,
          noteId: quiz.noteId
        };
      } catch (error) {
        console.error('Error fetching quiz:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to fetch quiz'
        });
      }
    }),
});
