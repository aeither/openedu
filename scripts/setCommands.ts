import 'dotenv/config';

// Define the structure for Telegram Bot Commands
interface BotCommand {
  command: string;
  description: string;
}

// List of commands to register
const commands: BotCommand[] = [
  { command: 'start', description: 'Start interacting with the bot' },
  { command: 'quiz', description: 'Generate a web quiz instantly from text' },
  { command: 'quizzes', description: 'View your past web quizzes' },
  { command: 'status', description: 'Check your scheduled quiz status' },
  { command: 'video_quiz', description: 'Create a quiz video from text' },
  { command: 'video_status', description: 'Check quiz video rendering progress' },
  // Add other user-facing commands here
];

async function setTelegramCommands() {
    const botToken = process.env.TG_BOT_TOKEN;

  if (!botToken) {
    console.error('Error: BOT_TOKEN environment variable is not set.');
    process.exit(1); // Exit with error code
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/setMyCommands`;

  console.log('Attempting to set bot commands...');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commands }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      console.log('✅ Bot commands updated successfully!');
      console.log('Registered commands:');
      commands.forEach(cmd => console.log(`  /${cmd.command} - ${cmd.description}`));
    } else {
      console.error('❌ Failed to set bot commands.');
      console.error(`Status: ${response.status}`);
      console.error('Response:', result);
    }
  } catch (error) {
    console.error('❌ An error occurred while setting bot commands:', error);
  }
}

// Run the function
setTelegramCommands(); 