# telegram-bots

## Building

First, you should create a .env file:
```env
TELEGRAM_CHAT_ID=...
GEEV_BOT_ID=...
GEEV_AUTH_TOKEN=...
```

Once that's done, run:
```bash
yarn build
docker-compose up --build
```
