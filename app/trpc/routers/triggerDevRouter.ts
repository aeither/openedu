import { db } from '@/db/drizzle';
import { schedulers } from '@/db/schema';
import { generateBreakdownTool } from '@/mastra/tools';
import { runs } from '@trigger.dev/sdk/v3';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import { scheduledQuizTask } from '../../../src/trigger/quizScheduler';
import { createTRPCRouter, publicProcedure } from "../init";

export const triggerDevRouter = createTRPCRouter({
  triggerScheduledQuiz: publicProcedure
    .input(z.object({
      chatId: z.string(),
      content: z.string(),
      days: z.number()
    }))
    .mutation(async ({ input }) => {
      try {
        // Check if the user already has an active scheduler
        const userAddress = `telegram:${input.chatId}`;
        const existingScheduler = await db.query.schedulers.findFirst({
          where: (s, { eq, and }) => and(
            eq(s.userAddress, userAddress),
            eq(s.status, "running")
          ),
        });
        
        if (existingScheduler) {
          // Return status indicating already running
          return {
            status: 'already_running',
            message: `You already have an active quiz series about "${existingScheduler.content}" (Day ${existingScheduler.currentDay}/${existingScheduler.totalDays}). Please complete it before starting a new one.`,
            details: {
              content: existingScheduler.content,
              currentDay: existingScheduler.currentDay,
              totalDays: existingScheduler.totalDays
            } 
          };
        }
        
        // Start the scheduled quiz series with day 1
        const handle = await scheduledQuizTask.trigger({
          chatId: input.chatId,
          content: input.content,
          days: input.days,
          currentDay: 1, // Start with day 1
        });
        
        // Create a scheduler record
        const breakdownRes = await generateBreakdownTool.execute?.({ context: { content: input.content, totalDays: input.days } }) || { breakdown: [] };
        await db.insert(schedulers)
          .values({
            id: uuidv4(),
            userAddress: userAddress,
            triggerRunningId: handle.id,
            currentDay: 1,
            totalDays: input.days,
            content: input.content,
            breakdown: breakdownRes.breakdown,
            createdAt: new Date()
          });
          
        // Return status indicating creation and the handle
        return { 
          status: 'created', 
          handle: handle 
        };
      } catch (error) {
        console.error('Error triggering scheduledQuizTask:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Scheduled quiz task failed',
        });
      }
    }),
  getUserSchedule: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Find scheduler for this user
        const userAddress = `telegram:${input.chatId}`;
        const schedulerEntry = await db.query.schedulers.findFirst({
          where: (s, { eq }) => eq(s.userAddress, userAddress),
          orderBy: (s, { desc }) => [desc(s.createdAt)]
        });
        
        if (!schedulerEntry) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No active quiz schedule found' });
        }
        
        // Format the schedule information with proper type safety
        const scheduleInfo: {
          runId: string | null;
          content: string | null;
          progress: {
            currentDay: number;
            totalDays: number;
            percentComplete: number;
          };
          startedAt: Date;
          status?: string;
          nextRunTime?: string;
        } = {
          runId: schedulerEntry.triggerRunningId,
          content: schedulerEntry.content,
          progress: {
            currentDay: schedulerEntry.currentDay || 1,
            totalDays: schedulerEntry.totalDays || 1,
            percentComplete: Math.round(((schedulerEntry.currentDay || 1) / (schedulerEntry.totalDays || 1)) * 100)
          },
          startedAt: schedulerEntry.createdAt,
        };
        
        // If there's a trigger ID, get more details from Trigger.dev
        if (schedulerEntry.triggerRunningId) {
          try {
            const run = await runs.retrieve(schedulerEntry.triggerRunningId);
            scheduleInfo.status = schedulerEntry.status || run.status;
            scheduleInfo.nextRunTime = run.output?.nextRunTime;
            
            // Check if run is completed but scheduler hasn't been marked completed
            if (run.status === "COMPLETED" && 
                (((schedulerEntry.currentDay || 0) >= (schedulerEntry.totalDays || 0)) || !run.output?.nextRunTime) && 
                schedulerEntry.status === "running") {
              console.log("Marking scheduler as completed:", schedulerEntry.id);
              // Update status to completed
              await db.update(schedulers)
                .set({ status: "completed" })
                .where(eq(schedulers.id, schedulerEntry.id));
                
              // Update local status for response
              scheduleInfo.status = "completed";
            }
          } catch (runError) {
            console.error("Error retrieving run details:", runError);
            scheduleInfo.status = "UNKNOWN";
          }
        }
        
        return scheduleInfo;
      } catch (error) {
        console.error("Error retrieving user schedule:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Retrieving user schedule failed",
        });
      }
    }),
  // Complete an active quiz series so user can start a new one
  completeScheduledQuiz: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const userAddress = `telegram:${input.chatId}`;
        // Find the active running scheduler
        const existing = await db.query.schedulers.findFirst({
          where: (s, { eq, and }) => and(
            eq(s.userAddress, userAddress),
            eq(s.status, 'running')
          )
        });
        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No active quiz series to complete' });
        }
        // Mark it completed
        await db.update(schedulers)
          .set({ status: 'completed' })
          .where(eq(schedulers.id, existing.id));
        return { success: true };
      } catch (error) {
        console.error('Error completing scheduler:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to complete quiz series' });
      }
    }),
});
