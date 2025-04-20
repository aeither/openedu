import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { helloWorldTask, helloWorldDelayedTask } from '../../../src/trigger/example';
import { scheduledQuizTask } from '../../../src/trigger/quizScheduler';
import { TRPCError } from '@trpc/server';
import { db } from '@/db/drizzle';
import { users, schedulers } from '@/db/schema';
import { runs } from '@trigger.dev/sdk/v3';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const triggerDevRouter = createTRPCRouter({
  triggerHelloWorld: publicProcedure
    .input(z.object({ chatId: z.string(), action: z.string(), data: z.object({ message: z.string() }) }))
    .mutation(async ({ input }) => {
      try {
        // Trigger and store run ID
        const handle = await helloWorldTask.trigger(input);
        await db.insert(schedulers)
          .values({
            id: uuidv4(),
            userAddress: input.chatId,
            triggerRunningId: handle.id,
            createdAt: new Date()
          });
        return handle;
      } catch (error) {
        console.error('Error triggering helloWorldTask:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Trigger task failed',
        });
      }
    }),
  triggerHelloWorldDelayed: publicProcedure
    .input(z.object({ chatId: z.string(), action: z.string(), data: z.object({ message: z.string() }) }))
    .mutation(async ({ input }) => {
      try {
        // Trigger delayed task and store run ID
        const handle = await helloWorldDelayedTask.trigger(input);
        await db.insert(schedulers)
          .values({
            id: uuidv4(),
            userAddress: input.chatId,
            triggerRunningId: handle.id,
            createdAt: new Date()
          });
        return handle;
      } catch (error) {
        console.error('Error triggering helloWorldDelayedTask:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Trigger delayed task failed',
        });
      }
    }),
  triggerScheduledQuiz: publicProcedure
    .input(z.object({
      chatId: z.string(),
      content: z.string(),
      days: z.number()
    }))
    .mutation(async ({ input }) => {
      try {
        // Check if the user already has an active scheduler
        const existingScheduler = await db.query.schedulers.findFirst({
          where: (s, { eq, and }) => and(
            eq(s.userAddress, input.chatId),
            eq(s.status, "running")
          ),
        });
        
        if (existingScheduler) {
          // User already has an active scheduler
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `You already have an active quiz series about "${existingScheduler.content}" (Day ${existingScheduler.currentDay}/${existingScheduler.totalDays}). Please complete it before starting a new one.`,
          });
        }
        
        // Start the scheduled quiz series with day 1
        const handle = await scheduledQuizTask.trigger({
          chatId: input.chatId,
          content: input.content,
          days: input.days,
          currentDay: 1, // Start with day 1
        });
        
        // Create a scheduler record
        await db.insert(schedulers)
          .values({
            id: uuidv4(),
            userAddress: input.chatId,
            triggerRunningId: handle.id,
            currentDay: 1,
            totalDays: input.days,
            content: input.content,
            createdAt: new Date()
          });
          
        return handle;
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
        const schedulerEntry = await db.query.schedulers.findFirst({
          where: (s, { eq }) => eq(s.userAddress, input.chatId),
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
});
