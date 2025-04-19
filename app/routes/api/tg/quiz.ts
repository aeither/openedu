import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { generateQuizTool } from '@/mastra/tools'
import { db } from '@/db/drizzle'
import { notes, quizzes, users } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { eq, desc } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/tg/quiz')({
  GET: async ({ request, params }) => {
    try {
      // Get the chat_id from query parameter
      const url = new URL(request.url)
      const chatId = url.searchParams.get('chat_id')
      
      if (!chatId) {
        return json({ error: 'Missing chat_id parameter' }, { status: 400 })
      }
      
      const userAddress = `telegram:${chatId}`
      
      // Query all quizzes for this user through notes
      const userQuizzes = await db
        .select({
          quiz: quizzes,
          noteContent: notes.content,
          createdAt: notes.createdAt
        })
        .from(quizzes)
        .innerJoin(notes, eq(quizzes.noteId, notes.id))
        .where(eq(notes.userAddress, userAddress))
        .orderBy(desc(notes.createdAt))
      
      // Format the quizzes for response
      const formattedQuizzes = userQuizzes.map(item => {
        // Safely access quiz data with type checking
        const quizData = item.quiz.quizData as { questions: any[] } | undefined
        const questionCount = quizData?.questions?.length || 0
        
        return {
          id: item.quiz.id,
          noteContent: item.noteContent.substring(0, 100) + (item.noteContent.length > 100 ? '...' : ''),
          questionCount,
          createdAt: item.createdAt,
          // Generate quiz URL based on environment
          url: `${process.env.NODE_ENV === 'development' 
            ? 'https://basically-enough-clam.ngrok-free.app' 
            : 'https://openedu.dailywiser.xyz'}/quiz/${item.quiz.id}`
        }
      })
      
      return json({ 
        chat_id: chatId,
        quizzes: formattedQuizzes
      })
    } catch (error) {
      console.error('Error fetching user quizzes:', error)
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch quizzes' 
      }, { status: 500 })
    }
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
        ? 'https://basically-enough-clam.ngrok-free.app' 
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
  },
  DELETE: async ({ request }) => {
    try {
      // Get the query parameters
      const url = new URL(request.url)
      const quizId = url.searchParams.get('quiz_id')
      const chatId = url.searchParams.get('chat_id')
      
      // Validate required parameters
      if (!quizId) {
        return json({ error: 'Missing quiz_id parameter' }, { status: 400 })
      }
      
      if (!chatId) {
        return json({ error: 'Missing chat_id parameter' }, { status: 400 })
      }
      
      const userAddress = `telegram:${chatId}`
      
      // First check if the quiz exists and belongs to the user
      const quizWithNote = await db
        .select({ 
          quizId: quizzes.id,
          noteId: quizzes.noteId,
          userAddress: notes.userAddress
        })
        .from(quizzes)
        .innerJoin(notes, eq(quizzes.noteId, notes.id))
        .where(eq(quizzes.id, quizId))
        .limit(1)
      
      // If no quiz found or doesn't belong to this user
      if (quizWithNote.length === 0) {
        return json({ error: 'Quiz not found' }, { status: 404 })
      }
      
      if (quizWithNote[0].userAddress !== userAddress) {
        return json({ error: 'Unauthorized. This quiz does not belong to you.' }, { status: 403 })
      }
      
      // Delete the quiz
      await db.delete(quizzes).where(eq(quizzes.id, quizId))
      
      // Optionally delete the associated note if you want
      // This is commented out by default since you might want to keep notes
      // await db.delete(notes).where(eq(notes.id, quizWithNote[0].noteId))
      
      return json({ 
        success: true,
        message: 'Quiz successfully deleted',
        deleted_quiz_id: quizId
      })
    } catch (error) {
      console.error('Error deleting quiz:', error)
      return json({ 
        error: error instanceof Error ? error.message : 'Failed to delete quiz' 
      }, { status: 500 })
    }
  }
})
