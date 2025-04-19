import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { helloWorldTask, helloWorldDelayedTask } from '../../../src/trigger/example';
import { scheduledQuizTask } from '../../../src/trigger/quizScheduler';
import { TRPCError } from '@trpc/server';
import { db } from '@/db/drizzle';
import { users, schedulers } from '@/db/schema';
import { runs } from '@trigger.dev/sdk/v3';
import { eq } from 'drizzle-orm';
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
  listUserTasks: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Find scheduler for this user
        const schedulerEntry = await db.query.schedulers.findFirst({
          where: (s, { eq }) => eq(s.userAddress, input.chatId),
          orderBy: (s, { desc }) => [desc(s.createdAt)]
        });
        
        if (!schedulerEntry?.triggerRunningId) {
          // If no scheduler found, try the legacy approach
          const user = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.address, input.chatId)
          });
          
          if (!user?.triggerRunningId) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No run ID found for user' });
          }
          
          // Fetch run details using legacy approach
          const run = await runs.retrieve(user.triggerRunningId);
          return run;
        }
        
        // Fetch run details from scheduler
        const run = await runs.retrieve(schedulerEntry.triggerRunningId);
        return run;
      } catch (error) {
        console.error("Error retrieving user run:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Retrieving user run failed",
        });
      }
    }),
});
