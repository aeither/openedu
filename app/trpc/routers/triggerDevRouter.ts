import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { helloWorldTask } from '../../../src/trigger/example';

export const triggerDevRouter = createTRPCRouter({
  call: publicProcedure
    .input(z.object({ chatId: z.string(), action: z.string(), data: z.object({ message: z.string() }) }))
    .mutation(async ({ input }) => {
      // Trigger the hello-world task using Trigger.dev
      return await helloWorldTask.trigger(input);
    }),
});
