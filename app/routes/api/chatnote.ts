import { mastra } from '@/mastra';
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { Message } from '@ai-sdk/react';

export const APIRoute = createAPIFileRoute('/api/chatnote')({
  GET: ({ request, params }) => {
    return json({ message: 'Hello "/api/chatnote"!' })
  },
  POST: async ({ request, params }) => {
    try {
      const { messages }: { messages: Message[] } = await request.json();
      console.log("🚀 ~ POST: ~ messages:", messages)

      // Extract the system message (which contains the note content)
      const systemMessage = messages.find(m => m.role === 'system');
      const noteContent = systemMessage?.content || 'No note content provided.';

      // Get the chatNoteAgent
      const chatNoteAgent = mastra.getAgent('chatNoteAgent');

      // For now, we'll use the existing approach from chat.ts
      // Just pass the messages directly and let the agent handle the system prompt
      // This follows the pattern used in your other agents

      // We'll use the last user message to avoid potential issues
      const lastUserMessage = messages
        .filter(m => m.role === 'user')
        .pop()?.content || '';

      // Create a contextual prompt including the note content
      const contextualPrompt = `Note content for reference:\n\n${noteContent}\n\nUser question: ${lastUserMessage}`;

      // Generate the chat stream using the chatNoteAgent
      const stream = await chatNoteAgent.stream(contextualPrompt, {
        maxSteps: 1
      });

      // Return the streaming response
      return stream.toDataStreamResponse({ sendReasoning: false });
    } catch (error) {
      console.error("Error in /api/chatnote:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return json({ error: 'Failed to process chat request', details: errorMessage }, { status: 500 });
    }
  },
});
