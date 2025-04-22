import { createTRPCRouter } from "./init";
import { notificationRouter } from "./routers/notificationRouter";
import { postRouter } from "./routers/postRouter";
import { userRouter } from "./routers/userRouter";
import { quizRouter } from "./routers/quizRouter";
import { notesRouter } from "./routers/notesRouter";
import { flashcardRouter } from "./routers/flashcardRouter";
import { triggerDevRouter } from "./routers/triggerDevRouter";
import { aiRouter } from "./routers/aiRouter";
import { imageRouter } from "./routers/imageRouter";

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  notification: notificationRouter,
  quiz: quizRouter,
  notes: notesRouter,
  flashcard: flashcardRouter,
  triggerDev: triggerDevRouter,
  ai: aiRouter,
  image: imageRouter,
});

export type TRPCRouter = typeof trpcRouter;
