#!/usr/bin/env ts-node
import 'dotenv/config';

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;
if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
  console.error('Error: TG_BOT_TOKEN and TG_CHAT_ID must be set in .env');
  process.exit(1);
}

// Hard-coded via environment for testing
const text = process.env.TG_TEXT || 'Hello from OpenEdu test';
const buttonUrl = "https://openedu.dailywiser.xyz"
const buttonText ='Click Here';

const messageData: any = { chat_id: TG_CHAT_ID, text };

if (buttonUrl) {
  messageData.reply_markup = {
    inline_keyboard: [[{ text: buttonText, url: buttonUrl }]],
  };
}

(async () => {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error('Telegram API error:', data);
      process.exit(1);
    }
    console.log('Message sent:', data);
  } catch (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }
})();
