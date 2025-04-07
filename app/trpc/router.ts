import { createTRPCRouter } from "./init";
import { notificationRouter } from "./routers/notificationRouter";
import { postRouter } from "./routers/postRouter";
import { taskRouter } from "./routers/taskRouter";
import { userRouter } from "./routers/userRouter";

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  task: taskRouter,
  user: userRouter,
  notification: notificationRouter,
});

export type TRPCRouter = typeof trpcRouter;
