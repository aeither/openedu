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
