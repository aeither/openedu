import { createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '@/db/drizzle';
import { users, notes, quizzes, schedulers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

async function handler({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const payload = (await request.json()) as { chatId: string; action: string; data?: any };
    let text = payload.action;

    // Handle different action types
    if (payload.action === 'generate_quiz') {
      // Get user from database
      const userAddress = payload.chatId;
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.address, userAddress)
      });

      if (!user) {
        throw new Error(`User with address ${userAddress} not found`);
      }

      const { message, day, totalDays } = payload.data;
      
      // Find or create scheduler entry
      const scheduler = await db.query.schedulers.findFirst({
        where: (s, { eq, and }) => and(
          eq(s.userAddress, userAddress),
          eq(s.content, message)
        )
      });
      
      if (scheduler) {
        // Update existing scheduler
        await db.update(schedulers)
          .set({ 
            currentDay: day,
          })
          .where(eq(schedulers.id, scheduler.id));
        
        // If we've reached the end of the quiz series, remove the scheduler
        if (day >= totalDays) {
          await db.delete(schedulers)
            .where(eq(schedulers.id, scheduler.id));
        }
      } else {
        // Create new scheduler entry
        await db.insert(schedulers)
          .values({
            id: uuidv4(),
            userAddress: userAddress,
            triggerRunningId: user.triggerRunningId,
            currentDay: day,
            totalDays: totalDays,
            content: message,
            createdAt: new Date(),
          });
      }

      // Format a nice message for quiz generation
      text = `📚 Daily Quiz ${day}/${totalDays} 📚\n\nHere's your quiz for today on: ${message}\n\nClick the link below to take your quiz!`;
      
      // Actually generate the quiz and store it in database
      const quizId = uuidv4();
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'https://basically-enough-clam.ngrok-free.app' 
        : 'https://openedu.dailywiser.xyz';
      
      // Generate and store the quiz content
      try {
        // Create a note entry first
        const [newNote] = await db.insert(notes)
          .values({
            id: uuidv4(),
            userAddress: `telegram:${userAddress}`,
            content: message,
            createdAt: new Date(),
          })
          .returning();
          
        // Generate quiz questions using AI directly
        const quizData = await generateObject({
          model: groq("llama-3.3-70b-versatile"),
          messages: [
            {
              role: "system",
              content:
                "You are a teacher. Your job is to take a document, and create a multiple choice test (with 4 questions) based on the content of the document. Each option should be roughly equal in length. For each question, also include a brief explanation of why the correct answer is correct.",
            },
            {
              role: "user",
              content: `Create 4 multiple choice quiz questions based on the following content:\n\n${message}`
            }
          ],
          output: 'array',
          schema: z.object({
            question: z.string(),
            options: z
              .array(z.string())
              .length(4)
              .describe(
                "Four possible answers to the question. Only one should be correct. They should all be of equal lengths.",
              ),
            answer: z
              .enum(["A", "B", "C", "D"])
              .describe(
                "The correct answer, where A is the first option, B is the second, and so on.",
              ),
            explanation: z
              .string()
              .describe(
                "A brief explanation of why the correct answer is correct."
              ),
          }),
        });
        
        // Store the quiz data
        const [newQuiz] = await db.insert(quizzes)
          .values({
            id: quizId,
            noteId: newNote.id,
            quizData: { questions: quizData.object },
            createdAt: new Date(),
          })
          .returning();
          
        console.log("Generated quiz:", newQuiz.id);
      } catch (error) {
        console.error("Error generating and storing quiz:", error);
      }
      
      const quizUrl = `${baseUrl}/quiz/${quizId}`;
      
      // Send quiz to user with the quiz URL
      await fetch(
        `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: payload.chatId, 
            text,
            reply_markup: {
              inline_keyboard: [
                [{ text: "Take Quiz", url: quizUrl }]
              ]
            }
          }),
        }
      );
    } else {
      // Default message handling for other actions
      text = payload.action + (payload.data ? `: ${JSON.stringify(payload.data)}` : '');
      await fetch(
        `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: payload.chatId, text }),
        }
      );
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const APIRoute = createAPIFileRoute('/api/webhook')({
  POST: handler,
});