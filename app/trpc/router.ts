import { createTRPCRouter } from "./init";
import { notificationRouter } from "./routers/notificationRouter";
import { postRouter } from "./routers/postRouter";
import { userRouter } from "./routers/userRouter";
import { quizRouter } from "./routers/quizRouter";

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  notification: notificationRouter,
  quiz: quizRouter,
});

export type TRPCRouter = typeof trpcRouter;
