import { createAPIFileRoute } from '@tanstack/react-start/api';
import { generateQuizTool } from '../../mastra/tools';
import { z } from 'zod';

const quizRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  count: z.number().int().min(1).max(10).default(4)
});

type QuizRequest = z.infer<typeof quizRequestSchema>;

async function handleQuizGeneration({ request }: { request: Request }) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input with zod
    const result = quizRequestSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: result.error.format()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { topic, count } = result.data;
    
    // Check if the tool is available
    if (!generateQuizTool || typeof generateQuizTool.execute !== 'function') {
      throw new Error('Quiz generation tool is not available');
    }
    
    // Generate quiz using the tool
    const quizResponse = await generateQuizTool.execute({
      context: {
        content: topic,
        count
      }
    });
    
    // Return the generated quiz
    return new Response(JSON.stringify(quizResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error generating quiz:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate quiz',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const APIRoute = createAPIFileRoute('/api/quiz')({
  POST: handleQuizGeneration
});