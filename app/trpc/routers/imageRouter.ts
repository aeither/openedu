import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { describeImageTool } from "../../mastra/tools"; // Adjust path if necessary
import { TRPCError } from "@trpc/server";

// Schema for image description request
const describeImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL")
});

export const imageRouter = createTRPCRouter({
  describeImage: publicProcedure
    .input(describeImageSchema)
    .mutation(async ({ input }) => {
      const { imageUrl } = input;

      // Check if the tool is available
      if (!describeImageTool || typeof describeImageTool.execute !== 'function') {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Image description tool is not available"
        });
      }

      try {
        // Describe the image using the tool
        const descriptionResponse = await describeImageTool.execute({
          context: {
            imageUrl
          }
        });

        return descriptionResponse; // contains { description: "..." }
      } catch (error) {
        console.error('Error describing image:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : 'Failed to describe image'
        });
      }
    }),
}); 