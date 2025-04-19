import { createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '@/db/drizzle';
import { users, notes, quizzes, schedulers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper function to get base URL based on environment
const getBaseUrl = () => 
  process.env.NODE_ENV === 'development' 
    ? 'https://basically-enough-clam.ngrok-free.app' 
    : 'https://openedu.dailywiser.xyz';

// Helper function to schedule the next quiz
async function scheduleNextQuiz(chatId: string, content: string, days: number) {
  try {
    const triggerUrl = `${getBaseUrl()}/api/trpc/triggerDev.triggerScheduledQuiz?batch=1`;
    
    const response = await fetch(triggerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        json: {
          chatId,
          content,
          days,
        }
      }])
    });
    
    const result = await response.json();
    return result?.result?.data?.id || null;
  } catch (error) {
    console.error("Error scheduling next quiz:", error);
    return null;
  }
}

// Helper function to generate quiz questions
async function generateQuizQuestions(content: string) {
  return generateObject({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      {
        role: "system",
        content:
          "You are a teacher. Your job is to take a document, and create a multiple choice test (with 4 questions) based on the content of the document. Each option should be roughly equal in length. For each question, also include a brief explanation of why the correct answer is correct.",
      },
      {
        role: "user",
        content: `Create 4 multiple choice quiz questions based on the following content:\n\n${content}`
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
}

// Helper function to send Telegram message
async function sendTelegramMessage(chatId: string, text: string, quizUrl?: string) {
  const messageData: any = { 
    chat_id: chatId, 
    text
  };
  
  if (quizUrl) {
    messageData.reply_markup = {
      inline_keyboard: [
        [{ text: "Take Quiz", url: quizUrl }]
      ]
    };
  }
  
  await fetch(
    `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    }
  );
}

// Main handler function
async function handler({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  try {
    const payload = (await request.json()) as { chatId: string; action: string; data?: any };
    
    // Handle quiz generation
    if (payload.action === 'generate_quiz') {
      return await handleQuizGeneration(payload);
    } 
    
    // Handle other actions with default messaging
    const text = payload.action + (payload.data ? `: ${JSON.stringify(payload.data)}` : '');
    await sendTelegramMessage(payload.chatId, text);
    
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

// Handler specifically for quiz generation
async function handleQuizGeneration(payload: { chatId: string; action: string; data?: any }) {
  const userAddress = payload.chatId;
  const { message, day, totalDays } = payload.data;
  
  // Get user from database
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.address, userAddress)
  });

  if (!user) {
    throw new Error(`User with address ${userAddress} not found`);
  }
  
  // Handle scheduler management
  await updateSchedulerForQuiz(userAddress, message, day, totalDays);
  
  // Generate the quiz and prepare response
  const quizId = await createAndStoreQuiz(userAddress, message);
  
  // Format a nice message for quiz generation
  const text = `📚 Daily Quiz ${day}/${totalDays} 📚\n\nHere's your quiz for today on: ${message}\n\nClick the link below to take your quiz!`;
  const quizUrl = `${getBaseUrl()}/quiz/${quizId}`;
  
  // Send quiz to user
  await sendTelegramMessage(payload.chatId, text, quizUrl);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Update or create scheduler records
async function updateSchedulerForQuiz(userAddress: string, content: string, day: number, totalDays: number) {
  // Find existing scheduler entry
  const scheduler = await db.query.schedulers.findFirst({
    where: (s, { eq, and }) => and(
      eq(s.userAddress, userAddress),
      eq(s.content, content)
    )
  });
  
  if (scheduler) {
    // Update existing scheduler
    await db.update(schedulers)
      .set({ currentDay: day })
      .where(eq(schedulers.id, scheduler.id));
    
    // Handle end of series or schedule next quiz
    if (day >= totalDays) {
      await db.delete(schedulers).where(eq(schedulers.id, scheduler.id));
    } else {
      await scheduleNextQuiz(userAddress, content, totalDays);
    }
  } else {
    // Create new scheduler entry
    const triggerId = await scheduleNextQuiz(userAddress, content, totalDays);
    
    await db.insert(schedulers).values({
      id: uuidv4(),
      userAddress: userAddress,
      triggerRunningId: triggerId,
      currentDay: day,
      totalDays: totalDays,
      content: content,
      createdAt: new Date(),
    });
  }
}

// Create and store a new quiz
async function createAndStoreQuiz(userAddress: string, content: string) {
  const quizId = uuidv4();
  
  try {
    // Create a note entry first
    const [newNote] = await db.insert(notes)
      .values({
        id: uuidv4(),
        userAddress: `telegram:${userAddress}`,
        content: content,
        createdAt: new Date(),
      })
      .returning();
      
    // Generate quiz questions
    const quizData = await generateQuizQuestions(content);
    
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
  
  return quizId;
}

export const APIRoute = createAPIFileRoute('/api/webhook')({
  POST: handler,
});