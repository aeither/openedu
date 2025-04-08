import { createTRPCRouter } from "./init";
import { notificationRouter } from "./routers/notificationRouter";
import { postRouter } from "./routers/postRouter";
import { userRouter } from "./routers/userRouter";

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  notification: notificationRouter,
});

export type TRPCRouter = typeof trpcRouter;
