# Roistat AI — Knowledge Assistant

Чат-бот для сотрудников на базе Claude Sonnet 4 + документация help-ru.roistat.com.

## Структура
```
roistat-bot/
├── server.js        # Node.js бэкенд (проксирует запросы к Claude API)
├── package.json
└── public/
    └── index.html   # Весь фронтенд (один файл, без зависимостей)
```

## Деплой на Railway (5 минут)

1. Зарегистрируйтесь на https://railway.app
2. Нажмите **New Project → Deploy from GitHub**
   - Загрузите папку `roistat-bot` в новый GitHub-репозиторий (или используйте Railway CLI)
3. В настройках проекта Railway → **Variables** добавьте:
   ```
   ANTHROPIC_API_KEY=sk-ant-...ваш ключ...
   ```
4. Railway автоматически запустит `npm start` — бот будет доступен по выданному URL.

### Вариант через Railway CLI (без GitHub)
```bash
npm install -g @railway/cli
railway login
cd roistat-bot
railway init
railway up
railway variables set ANTHROPIC_API_KEY=sk-ant-...
```

## Деплой на VPS (Ubuntu)

```bash
# Установить Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Скопировать файлы и запустить
cd roistat-bot
ANTHROPIC_API_KEY=sk-ant-... node server.js

# Для постоянной работы — PM2
npm install -g pm2
ANTHROPIC_API_KEY=sk-ant-... pm2 start server.js --name roistat-bot
pm2 save && pm2 startup
```

## Получение API-ключа Anthropic

1. Зайдите на https://console.anthropic.com
2. Settings → API Keys → Create Key
3. Скопируйте ключ (начинается с `sk-ant-`)

## Стоимость
Claude Sonnet 4: ~$3 за 1M входящих токенов / ~$15 за 1M исходящих.
Один диалог (~10 сообщений) ≈ $0.02–0.05.
