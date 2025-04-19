import { createAPIFileRoute } from '@tanstack/react-start/api';

async function handler({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const payload = (await request.json()) as { chatId: string; action: string; data?: any };
    let text = payload.action;

    // Handle different action types
    if (payload.action === 'generate_quiz') {
      const { message, day, totalDays } = payload.data;
      // Format a nice message for quiz generation
      text = `📚 Daily Quiz ${day}/${totalDays} 📚\n\nHere's your quiz for today on: ${message}\n\nClick the link below to take your quiz!`;
      
      // Generate the quiz here - this would normally happen through your quiz generation API
      const quizUrl = `https://openedu.dailywiser.xyz/quiz/${encodeURIComponent(message)}`;
      
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