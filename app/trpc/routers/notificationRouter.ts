import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const notificationRouter = createTRPCRouter({
  notifyFeedback: publicProcedure
    .input(
      z.object({
        feedback: z.string().min(1, "Feedback cannot be empty"),
        option: z.string(),
        userAddress: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Send notification to Telegram
        const telegramBotToken = process.env.TG_BOT_TOKEN;
        const telegramChatId = process.env.TG_CHAT_ID;

        if (!telegramBotToken || !telegramChatId) {
          console.error("Telegram environment variables (TG_BOT_TOKEN, TG_CHAT_ID) not set. Skipping notification.");
          return { success: true }; // Return success anyway
        }

        try {
          const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
          
          // Simple message format
          const message = `New Feedback\n\nFrom: ${input.userAddress}\nType: ${input.option}\n\nMessage: ${input.feedback}`;

          const response = await fetch(telegramApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: message,
            }),
          });

          if (!response.ok) {
            console.error('Telegram API error:', await response.text());
          }
        } catch (telegramError) {
          console.error('Error sending Telegram notification:', telegramError);
          // Don't throw the error to avoid failing the whole feedback process
        }

        // Return simple success response
        return {
          success: true
        };
      } catch (error) {
        console.error("Error processing feedback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process feedback",
        });
      }
    }),
});
