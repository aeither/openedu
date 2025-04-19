import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { helloWorldTask, helloWorldDelayedTask, getUserTasks } from '../../../src/trigger/example';
import { TRPCError } from '@trpc/server';

export const triggerDevRouter = createTRPCRouter({
  triggerHelloWorld: publicProcedure
    .input(z.object({ chatId: z.string(), action: z.string(), data: z.object({ message: z.string() }) }))
    .mutation(async ({ input }) => {
      try {
        // Trigger the hello-world task using Trigger.dev
        return await helloWorldTask.trigger(input);
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
        return await helloWorldDelayedTask.trigger(input);
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
        return await getUserTasks(input.chatId);
      } catch (error) {
        console.error("Error fetching user tasks:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Fetching user tasks failed",
        });
      }
    }),
});
