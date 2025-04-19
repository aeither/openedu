import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { helloWorldTask, helloWorldDelayedTask } from '../../../src/trigger/example';
import { TRPCError } from '@trpc/server';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { runs } from '@trigger.dev/sdk/v3';
import { eq } from 'drizzle-orm';

export const triggerDevRouter = createTRPCRouter({
  triggerHelloWorld: publicProcedure
    .input(z.object({ chatId: z.string(), action: z.string(), data: z.object({ message: z.string() }) }))
    .mutation(async ({ input }) => {
      try {
        // Trigger and store run ID
        const handle = await helloWorldTask.trigger(input);
        await db.update(users)
          .set({ triggerRunningId: handle.id })
          .where(eq(users.address, input.chatId));
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
        await db.update(users)
          .set({ triggerRunningId: handle.id })
          .where(eq(users.address, input.chatId));
        return handle;
      } catch (error) {
        console.error('Error triggering helloWorldDelayedTask:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Trigger delayed task failed',
        });
      }
    }),
  listUserTasks: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Retrieve stored run ID for user
        const user = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.address, input.chatId)
        });
        if (!user?.triggerRunningId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No run ID found for user' });
        }
        // Fetch run details
        const run = await runs.retrieve(user.triggerRunningId);
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
