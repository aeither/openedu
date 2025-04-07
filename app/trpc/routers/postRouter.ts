import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../init";

type Post = {
    id: string;
    title: string;
    body: string;
};

export const postRouter = {
    list: publicProcedure.query(async () => {
        const posts = await fetch(
            "https://jsonplaceholder.typicode.com/posts"
        ).then((r) => r.json() as Promise<Array<Post>>);
        return posts.slice(0, 10);
    }),
    byId: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const post = await fetch(
                `https://jsonplaceholder.typicode.com/posts/${input.id}`
            ).then((r) => {
                if (r.status === 404) {
                    throw new TRPCError({ code: "NOT_FOUND" });
                }
                return r.json() as Promise<Post>;
            });

            return post;
        }),
} satisfies TRPCRouterRecord;
