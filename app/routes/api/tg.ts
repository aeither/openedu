import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { generateQuizTool } from '../../mastra/tools'
import { db } from '@/db/drizzle'
import { notes, quizzes, users } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'

export const APIRoute = createAPIFileRoute('/api/tg')({
  GET: ({ request, params }) => {
    return json({ message: 'Hello "/api/tg"!' })
  },
  POST: async ({ request }) => {
    try {
      // Parse the Telegram update
      const update = await request.json()
      
      // Check if it's a message and has text
      if (!update.message || !update.message.text) {
        return json({ error: 'Invalid message format' }, { status: 400 })
      }
      
      const chatId = update.message.chat.id
      const content = update.message.text
      const userAddress = `telegram:${chatId}` // Use chatId as a unique identifier
      
      // Default number of questions
      const count = 4
      
      // Check if the tool is available
      if (!generateQuizTool || typeof generateQuizTool.execute !== 'function') {
        return json({ 
          error: "Quiz generation tool is not available" 
        }, { status: 500 })
      }
      
      // Create user if doesn't exist (before creating note)
      await db
        .insert(users)
        .values({
          address: userAddress,
          lastActive: new Date(),
        })
        .onConflictDoNothing();
      
      // Generate quiz using the tool
      const quizResponse = await generateQuizTool.execute({
        context: {
          content,
          count
        }
      })
      
      // Create a note in the database
      const noteId = uuidv4()
      await db.insert(notes).values({
        id: noteId,
        userAddress,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      
      // Create a quiz linked to that note
      const quizId = uuidv4()
      await db.insert(quizzes).values({
        id: quizId,
        noteId,
        quizData: quizResponse,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      
      // Format quiz questions for Telegram
      const formattedQuestions = quizResponse.questions.map((q, index) => {
        const options = q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')
        return `Question ${index + 1}: ${q.question}\n\n${options}`
      }).join('\n\n')
      
      // Generate quiz URL based on environment
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://openedu.dailywiser.xyz'
      const quizUrl = `${baseUrl}/quiz/${quizId}`
      
      // Prepare response for Telegram
      const telegramResponse = {
        method: 'sendMessage',
        chat_id: chatId,
        text: `📚 Quiz generated from your text:\n\n${formattedQuestions}\n\nPlay this quiz here: ${quizUrl}`,
        parse_mode: 'Markdown'
      }
      
      return json({
        telegram_response: telegramResponse,
        quiz_url: quizUrl,
        quiz_id: quizId
      })
    } catch (error) {
      console.error('Error in Telegram endpoint:', error)
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to process request' 
      }, { status: 500 })
    }
  }
})
