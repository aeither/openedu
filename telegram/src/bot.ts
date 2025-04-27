import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { Bot, InlineKeyboard } from "grammy";
import superjson from 'superjson';
import type { TRPCRouter } from '../../app/trpc/router';

// Define interface for quiz objects returned from API
interface UserQuiz {
  id: string;
  noteContent: string;
  questionCount: number;
  createdAt: string;
  url: string;
}

export function createBot(botToken: string, apiBaseUrl: string) {
  // Create bot instance
  const bot = new Bot(botToken);

  // Initialize tRPC client inside the function using the passed URL
  const trpc = createTRPCClient<TRPCRouter>({
    links: [httpBatchLink({ url: `${apiBaseUrl}/api/trpc`, transformer: superjson })],
  });

  // Move here

  // Handle start command - create user if not exists
  bot.command("start", async (ctx) => {
    try {
      const userAddress = `telegram:${ctx.chat.id}` // Use chatId as a unique identifier
      await trpc.user.createUser.mutate({ userAddress });
    } catch (err) {
      console.error("Error creating user:", err);
    }
    await ctx.reply(`Welcome to DailyWiser Bot! 🧠\n\nHere's how I can help you learn:\n\n• **Generate a quiz instantly:** Use \`/quiz <your learning content>\`.\n  *Example: \`/quiz The mitochondria is the powerhouse of the cell.\`*\n\n• **Schedule daily quizzes:** Just send me what you want to learn about (e.g., 'Teach me about photosynthesis for 5 days').\n\n• **Manage your quizzes:** Use \`/quizzes\` to see past quizzes and \`/status\` to check your scheduled series.\n\n• **Share:** Use \`/refer\` to share this bot with friends!\n\nSend any learning text or use a command to get started!`);
  });
  
  // Handle quiz command
  bot.command("quiz", async (ctx) => {
    // Get the text of the message
    const messageText = ctx.message?.text || "";
    
    // Extract content by removing the /quiz command
    // If the user just typed "/quiz", this will result in an empty string
    const content = messageText.replace(/^\/quiz($|\s+)/i, "").trim();
    
    // Check if content is provided
    if (!content || content.length === 0) {
      await ctx.reply("Please provide learning content after the /quiz command. For example:\n/quiz The Earth is the third planet from the Sun.");
      return;
    }
    
    await ctx.reply("Generating your quiz, please wait...");
    
    try {
      // Make API call to generate quiz
      const response = await generateQuiz(ctx.chat.id, content);
      
      // Create button with quiz URL
      const keyboard = new InlineKeyboard()
        .url("Take the Quiz", response.quiz_url);
      
      // Send response with button
      await ctx.reply("Your quiz is ready! Click the button below to start:", {
        reply_markup: keyboard
      });
    } catch (error: unknown) {
      console.error("Quiz generation error:", error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      await ctx.reply(`Sorry, I couldn't generate a quiz. Reason: ${errorMessage}`);
    }
  });

  // Handle refer command
  bot.command("refer", async (ctx) => {
    const referMessage = `📣 Share DailyWiser with your friends!

Try our brand new quiz generator bot: @easy_quiz_generator_bot

Just send some learning content, and we'll create an interactive quiz to help you learn better.

Share this message to help your friends learn more effectively!`;

    // Create an inline button for easy sharing
    const keyboard = new InlineKeyboard()
      .url("Try @easy_quiz_generator_bot", "https://t.me/easy_quiz_generator_bot");
    
    await ctx.reply(referMessage, {
      reply_markup: keyboard
    });
  });

  // Handle quizzes command
  bot.command("quizzes", async (ctx) => {
    try {
      await ctx.reply("Fetching your quizzes...");
      
      // Get user's quizzes from the backend
      const userQuizzes: UserQuiz[] = await fetchUserQuizzes(ctx.chat.id);
      
      if (!userQuizzes || userQuizzes.length === 0) {
        await ctx.reply("You haven't created any quizzes yet. Use /quiz followed by some text to create your first quiz!");
        return;
      }
      
      // Format the response
      let response = "📋 Your Recent Quizzes:\n\n";
      
      userQuizzes.forEach((quiz, index) => {
        const date = new Date(quiz.createdAt).toLocaleDateString();
        response += `${index + 1}. ${quiz.noteContent} (${date})\n`;
      });
      
      response += "\nClick on a quiz to take it again or delete it:";
      
      // Create inline buttons for each quiz with delete option
      const keyboard = new InlineKeyboard();
      userQuizzes.forEach((quiz, index) => {
        // Add a row with the quiz button and delete button side by side
        keyboard
          .url(`Quiz ${index + 1} (${quiz.questionCount} Q)`, quiz.url)
          .text('🗑️', `delete_quiz:${quiz.id}`);
        
        // Add a new row for the next quiz
        if (index < userQuizzes.length - 1) {
          keyboard.row();
        }
      });
      
      await ctx.reply(response, {
        reply_markup: keyboard
      });
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      await ctx.reply("Sorry, I couldn't fetch your quizzes. Please try again later.");
    }
  });


  // tRPC test command
  bot.command("me", async (ctx) => {
    try {
      const result = await trpc.user.me.query();
      await ctx.reply(`Hello, ${result.name}!`);
    } catch (err) {
      console.error("tRPC me error:", err);
      await ctx.reply("Failed to fetch user info.");
    }
  });

  // Command to retrieve latest Trigger.dev run for the user
  bot.command("status", async (ctx) => {
    try {
      const schedule = await trpc.triggerDev.getUserSchedule.query({
        chatId: ctx.chat.id.toString(),
      });
      
      // Format a user-friendly message
      const progressPercent = schedule.progress.percentComplete;
      const formattedDate = new Date(schedule.startedAt).toLocaleDateString();
      
      const message = `📚 Quiz Schedule Info 📚

Topic: ${schedule.content}
Progress: Day ${schedule.progress.currentDay} of ${schedule.progress.totalDays} (${progressPercent}%)
Started: ${formattedDate}
Status: ${schedule.status || 'Active'}`;
      
      // Provide a button to allow stopping the current quiz series
      const keyboard = new InlineKeyboard()
        .text("Complete quiz series", "complete_quiz_series");
      await ctx.reply(message, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error retrieving quiz schedule:", error);
      await ctx.reply(
        "You don't have any active quiz schedules. To create one, tell me what you'd like to learn about."
      );
    }
  });

  // Handle callback queries for quiz deletion
  bot.on("callback_query:data", async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    
    // Check if it's a delete quiz callback
    if (callbackData.startsWith("delete_quiz:")) {
      // Get the quiz ID from the callback data
      const quizId = callbackData.split(":")[1];
      
      try {
        // Add a check for ctx.chat
        if (!ctx.chat) {
          console.error("Chat context missing in delete_quiz callback");
          await ctx.answerCallbackQuery({ text: "Error: Cannot identify chat." });
          return;
        }
        // Delete the quiz (no ! needed now)
        await deleteQuiz(ctx.chat.id, quizId);
        
        // Acknowledge the callback query
        await ctx.answerCallbackQuery({
          text: "Quiz deleted successfully!"
        });
        
        // Update the message to remove the deleted quiz
        await ctx.editMessageText("Quiz has been deleted. Use /quizzes to see your updated list.");
        
      } catch (error) {
        console.error("Error deleting quiz:", error);
        
        // Acknowledge the callback query with error
        await ctx.answerCallbackQuery({
          text: "Failed to delete quiz. Please try again."
        });
      }
    } else if (callbackData === "complete_quiz_series") {
      try {
        // Add a check for ctx.chat
        if (!ctx.chat) {
          console.error("Chat context missing in complete_quiz_series callback");
          await ctx.answerCallbackQuery({ text: "Error: Cannot identify chat." });
          return;
        }
        // No ! needed now
        await trpc.triggerDev.completeScheduledQuiz.mutate({ chatId: ctx.chat.id.toString() });
        await ctx.answerCallbackQuery({ text: "Quiz series marked completed!" });
        await ctx.reply("Your quiz series is now completed. You can start a new one.");
      } catch (error) {
        console.error("Error completing quiz series:", error);
        await ctx.answerCallbackQuery({ text: "Failed to complete quiz series." });
      }
      return;
    }
  });

  // Handle non-text messages
  bot.on("message:text", async (ctx) => {
    try {
      // Get the text content of the message
      const message = ctx.message.text;
      // Ignore messages originating from bots (e.g. scheduled quiz notifications)
      if (ctx.from?.is_bot) return;
      // Skip command messages
      if (message.startsWith("/")) return;
      
      await ctx.reply("Thinking...");
      
      // Use AI to evaluate the message intent
      const evaluation = await trpc.ai.evaluateMessage.mutate({
        chatId: ctx.chat.id.toString(),
        message
      });
      
      // Handle different intents based on AI evaluation
      if (evaluation.intent === "quiz_scheduling") {
        // User wants scheduled quizzes
        const days = evaluation.days || 7; // Default to 7 days if not specified
        
        await ctx.reply(`Creating a ${days}-day quiz series about: ${evaluation.content}`);
        
        // Trigger the scheduled quiz task
        try {
          // Call the mutation
          const result = await trpc.triggerDev.triggerScheduledQuiz.mutate({
            chatId: ctx.chat.id.toString(),
            content: evaluation.content,
            days
          });

          // Check the result status
          if (result.status === 'created') {
            await ctx.reply(`Your quiz series has been scheduled! You'll receive your first quiz soon, followed by one quiz per day for ${days} days.`);
          } else if (result.status === 'already_running') {
             // Offer a button to complete the current quiz series
             const keyboard = new InlineKeyboard()
               .text("Mark series completed", "complete_quiz_series");
             await ctx.reply(result.message ?? 'An active quiz series is already running.', { reply_markup: keyboard });
          }
          
        } catch (error: unknown) {
          // Generic error handling for other failures (e.g., network, internal server)
          console.error("Error scheduling quiz series:", error);
          await ctx.reply("Sorry, I couldn't schedule your quiz series. Please try again later.");
        }
      } 
      else if (evaluation.intent === "quiz_now") {
        // User wants an immediate quiz
        await ctx.reply(`Generating a quiz about: ${evaluation.content}`);
        
        // Generate and send an immediate quiz
        try {
          const response = await generateQuiz(ctx.chat.id, evaluation.content);
          
          // Create button with quiz URL
          const keyboard = new InlineKeyboard()
            .url("Take the Quiz", response.quiz_url);
          
          // Send response with button
          await ctx.reply("Your quiz is ready! Click the button below to start:", {
            reply_markup: keyboard
          });
        } catch (error) {
          console.error("Quiz generation error:", error);
          await ctx.reply("Sorry, I couldn't generate a quiz. Please try again later.");
        }
      } 
      else {
        // General conversation
        await ctx.reply("I'm here to help with educational quizzes! You can:\n\n• Create an immediate quiz with /quiz [content]\n• Ask for a quiz series like 'create quizzes about space for the next 5 days'\n• View your quizzes with /quizzes");
      }
    } catch (error) {
      console.error("Error handling message:", error);
      await ctx.reply("Sorry, I encountered an error processing your request. Please try again later.");
    }
  });

  // Handle photo messages
  bot.on("message:photo", async (ctx) => {
    // Get the highest resolution photo
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    
    try {
      // Get file info from Telegram
      const file = await ctx.api.getFile(photo.file_id);
      
      // Build the URL using botToken
      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
      
      // Let the user know we are processing
      await ctx.reply("Analyzing the image...");

      // Call the tRPC endpoint (uses the trpc instance defined within createBot)
      const result = await trpc.image.describeImage.mutate({ imageUrl: fileUrl });
      
      // Send result back to user
      await ctx.reply(`⭐️ ${result.content}`);
    } catch (error) {
      console.error("Error handling photo message:", error);
      await ctx.reply("Sorry, I couldn't analyze the image. Please try again later.");
    }
  });

  // Handle non-text messages
  bot.on("message", async (ctx) => {
    if (!ctx.message.text) {
      await ctx.reply("Welcome to DailyWiser! 🧠\n\nUse /quiz followed by your learning content to generate a quiz, or simply tell me what you'd like to learn about.");
    }
  });

  // --- Helper Functions Defined INSIDE createBot ---

  async function fetchUserQuizzes(chatId: number): Promise<UserQuiz[]> {
    try {
      // Now has access to apiBaseUrl
      const quizzesUrl = `${apiBaseUrl}/api/tg/quiz?chat_id=${chatId}`; 
      const response = await fetch(quizzesUrl);
      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
      const data = await response.json();
      return data.quizzes;
    } catch (error) {
      console.error("API call to fetch quizzes failed:", error);
      throw error;
    }
  }

  async function deleteQuiz(chatId: number, quizId: string): Promise<void> {
    try {
      // Now has access to apiBaseUrl
      const deleteUrl = `${apiBaseUrl}/api/tg/quiz?chat_id=${chatId}&quiz_id=${quizId}`;
      const response = await fetch(deleteUrl, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API responded with status: ${response.status}`);
      }
      return;
    } catch (error) {
      console.error("API call to delete quiz failed:", error);
      throw error;
    }
  }

  async function generateQuiz(chatId: number, content: string) {
    try {
      // Now has access to apiBaseUrl
      const apiUrl = `${apiBaseUrl}/api/tg/quiz`;
      const requestBody = {
        message: { chat: { id: chatId }, text: content }
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
      const data = await response.json();
      if (!data.quiz_url) throw new Error("No quiz URL in response");
      return data;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  // --- End Helper Functions ---

  return bot;
}
