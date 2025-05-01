import { createTRPCRouter } from "./init";
import { aiRouter } from "./routers/aiRouter";
import { flashcardRouter } from "./routers/flashcardRouter";
import { imageRouter } from "./routers/imageRouter";
import { notesRouter } from "./routers/notesRouter";
import { notificationRouter } from "./routers/notificationRouter";
import { postRouter } from "./routers/postRouter";
import { quizRouter } from "./routers/quizRouter";
import { triggerDevRouter } from "./routers/triggerDevRouter";
import { userRouter } from "./routers/userRouter";
import { videoQuizRouter } from './routers/videoQuizRouter';

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
  videoQuiz: videoQuizRouter,
});

export type TRPCRouter = typeof trpcRouter;
