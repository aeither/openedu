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

V2 Approach
Telegram use TRPC Client -> TRPC Router use Trigger.dev -> Trigger.dev use Drizzle, Mastra and TG Fetch

PD: Trigger is needed to make it durable and delayable

Development
- src/trigger: Define Task
- app/trpc/routers/triggerDevRouter.ts: Put task in TRPC BE
    - Push to Github. Take 3 mins to live
- telegram/src/bot.ts: Trigger task

Test Log PROD
- https://cloud.trigger.dev/
- telegram bot response

Test Log DEV
- https://cloud.trigger.dev/

pn dev
pn dev:ngrok
pn dev:telegram

Test in local:
- Run `pn dlx trigger.dev@latest dev`, Run `pn dev` + webhook (not implemented)
Test in prod
- Run `pn dlx trigger.dev@latest deploy`, Commit and Push repo, Run `cd telegram` + `bun dev`

## Why do I need

TRPC for Trigger.dev: For Frontend and same call in telegram
Mastra and DB in Trigger.dev, TRPC or Webhook BE: TRPC Before scheudling, Trigger.dev After easy approach, Webhook BE reduce cost??