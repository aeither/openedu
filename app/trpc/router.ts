import { createTRPCRouter } from "./init";
import { notificationRouter } from "./routers/notificationRouter";
import { postRouter } from "./routers/postRouter";
import { userRouter } from "./routers/userRouter";
import { quizRouter } from "./routers/quizRouter";
import { notesRouter } from "./routers/notesRouter";
import { flashcardRouter } from "./routers/flashcardRouter";
import { triggerDevRouter } from "./routers/triggerDevRouter";

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  notification: notificationRouter,
  quiz: quizRouter,
  notes: notesRouter,
  flashcard: flashcardRouter,
  triggerDev: triggerDevRouter,
});

export type TRPCRouter = typeof trpcRouter;
