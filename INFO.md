use agent if need to convert string to input (serverside)
use tool directly if I have the inputs (clientside)
if require web3 client, use onToolCall (clientside)


For new ui tool: create tool, add to agent. create ui component add to chat.

--

## Send message to a Telegram chat

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?chat_id=<USER_CHAT_ID>&text=<MESSAGE_TEXT>
```

# Triggerdotdev

Dev

```bash
pn dlx trigger.dev@latest dev
```

Deploy

```bash
pn dlx trigger.dev@latest deploy
```

Flow: queue to receive a message tomorrow.
1. Wrap trigger task in webhook TRPC router for reusability in FE and TG (src/trigger with playground)
2. Telegram bot use TRPC to call webhook endpoint
3. trigger.dev call webhook endpoint
4. Webhook endpoint use TRPC to send message to telegram chat

