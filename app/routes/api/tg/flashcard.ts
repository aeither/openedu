import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { generateFlashcardTool } from '@/mastra/tools'
import { db } from '@/db/drizzle'
import { notes, flashcards, users } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { eq, desc } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/tg/flashcard')({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url)
      const chatId = url.searchParams.get('chat_id')
      if (!chatId) {
        return json({ error: 'Missing chat_id parameter' }, { status: 400 })
      }
      const userAddress = `telegram:${chatId}`
      // Get all flashcards for this user (through notes)
      const userFlashcards = await db
        .select({
          flashcard: flashcards,
          noteContent: notes.content,
          createdAt: flashcards.createdAt
        })
        .from(flashcards)
        .innerJoin(notes, eq(flashcards.noteId, notes.id))
        .where(eq(notes.userAddress, userAddress))
        .orderBy(desc(flashcards.createdAt))
      // Format for response
      const formatted = userFlashcards.map(item => ({
        id: item.flashcard.id,
        front: item.flashcard.front,
        back: item.flashcard.back,
        deckName: item.flashcard.deckName,
        noteContent: item.noteContent.substring(0, 100) + (item.noteContent.length > 100 ? '...' : ''),
        createdAt: item.createdAt
      }))
      return json({ chat_id: chatId, flashcards: formatted })
    } catch (error) {
      console.error('Error fetching user flashcards:', error)
      return json({ error: error instanceof Error ? error.message : 'Failed to fetch flashcards' }, { status: 500 })
    }
  },
  POST: async ({ request }) => {
    try {
      const update = await request.json()
      if (!update.message || !update.message.text) {
        return json({ error: 'Invalid message format' }, { status: 400 })
      }
      const chatId = update.message.chat.id
      const content = update.message.text
      const userAddress = `telegram:${chatId}`
      const count = 8
      // Check tool
      if (!generateFlashcardTool || typeof generateFlashcardTool.execute !== 'function') {
        return json({ error: 'Flashcard generation tool is not available' }, { status: 500 })
      }
      // Create user if doesn't exist
      await db.insert(users).values({ address: userAddress, lastActive: new Date() }).onConflictDoNothing()
      // Generate flashcards
      const flashcardResponse = await generateFlashcardTool.execute({ context: { content, count } })
      // Create a note in the database
      const noteId = uuidv4()
      await db.insert(notes).values({
        id: noteId,
        userAddress,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      // Insert each flashcard
      const deckName = `Deck ${new Date().toISOString().slice(0, 10)}`
      const flashcardIds = []
      for (const fc of flashcardResponse.flashcards) {
        const flashcardId = uuidv4()
        flashcardIds.push(flashcardId)
        await db.insert(flashcards).values({
          id: flashcardId,
          noteId,
          front: fc.front,
          back: fc.back,
          deckName,
          createdAt: new Date()
        })
      }
      // Format for Telegram
      const formatted = flashcardResponse.flashcards.map((fc, idx) => `*${idx + 1}.* ${fc.front}\n_${fc.back}_`).join('\n\n')
      return json({
        telegram_response: {
          method: 'sendMessage',
          chat_id: chatId,
          text: `🃏 Flashcards generated from your text:\n\n${formatted}`,
          parse_mode: 'Markdown'
        },
        deck_name: deckName,
        flashcard_ids: flashcardIds
      })
    } catch (error) {
      console.error('Error in Telegram flashcard endpoint:', error)
      return json({ error: error instanceof Error ? error.message : 'Failed to process request' }, { status: 500 })
    }
  },
  DELETE: async ({ request }) => {
    try {
      const url = new URL(request.url)
      const flashcardId = url.searchParams.get('flashcard_id')
      const chatId = url.searchParams.get('chat_id')
      if (!flashcardId) {
        return json({ error: 'Missing flashcard_id parameter' }, { status: 400 })
      }
      if (!chatId) {
        return json({ error: 'Missing chat_id parameter' }, { status: 400 })
      }
      const userAddress = `telegram:${chatId}`
      // Check ownership
      const fcWithNote = await db
        .select({
          flashcardId: flashcards.id,
          noteId: flashcards.noteId,
          userAddress: notes.userAddress
        })
        .from(flashcards)
        .innerJoin(notes, eq(flashcards.noteId, notes.id))
        .where(eq(flashcards.id, flashcardId))
        .limit(1)
      if (fcWithNote.length === 0) {
        return json({ error: 'Flashcard not found' }, { status: 404 })
      }
      if (fcWithNote[0].userAddress !== userAddress) {
        return json({ error: 'Unauthorized. This flashcard does not belong to you.' }, { status: 403 })
      }
      // Delete flashcard
      await db.delete(flashcards).where(eq(flashcards.id, flashcardId))
      return json({ success: true, message: 'Flashcard deleted', deleted_flashcard_id: flashcardId })
    } catch (error) {
      console.error('Error deleting flashcard:', error)
      return json({ error: error instanceof Error ? error.message : 'Failed to delete flashcard' }, { status: 500 })
    }
  }
})
