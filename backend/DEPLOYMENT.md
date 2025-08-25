# Деплой Backend на Render.com

Этот документ описывает процесс деплоя backend приложения на Render.com.

## 🚀 Подготовка к деплою

### 1. Подготовка репозитория

Убедитесь, что ваш код находится в GitHub репозитории и содержит все необходимые файлы:

- `package.json` с правильными скриптами
- `Dockerfile` для контейнеризации
- `prisma/schema.prisma` для базы данных
- `.env.example` с примером переменных окружения

### 2. Настройка базы данных

#### Вариант A: Supabase (рекомендуется)

1. Создайте аккаунт на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Перейдите в Settings → Database
4. Скопируйте Connection string (URI)
5. Замените `[YOUR-PASSWORD]` на ваш пароль

#### Вариант B: Neon

1. Создайте аккаунт на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте Connection string

## 🌐 Деплой на Render.com

### 1. Создание аккаунта

1. Зарегистрируйтесь на [render.com](https://render.com)
2. Подключите ваш GitHub аккаунт

### 2. Создание Web Service

1. Нажмите "New +" → "Web Service"
2. Подключите ваш GitHub репозиторий
3. Выберите ветку (обычно `main` или `master`)

### 3. Настройка сервиса

#### Основные настройки:

- **Name**: `blog-admin-backend` (или любое другое)
- **Environment**: `Node`
- **Region**: выберите ближайший к вам
- **Branch**: `main`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start:prod`

#### Переменные окружения:

Добавьте следующие переменные в разделе "Environment Variables":

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Admin Initialization
INIT_ADMIN_TOKEN="your-super-secret-init-token-here"
ADMIN_EMAIL="rrustamov986@gmail.com"
ADMIN_PASSWORD="Rrustamov9864"
ADMIN_NAME="Rustam Rustamov"

# Application
NODE_ENV="production"
PORT="3000"

# CORS
ALLOWED_ORIGINS="https://ruslan9864.github.io"

# Optional: Google OIDC
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Настройка базы данных

#### Вариант A: Встроенная PostgreSQL (Render)

1. Создайте новый PostgreSQL сервис в Render
2. Скопируйте Internal Database URL
3. Добавьте в переменные окружения:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   ```

#### Вариант B: Внешняя база данных (Supabase/Neon)

Используйте Connection string из вашей внешней базы данных.

### 5. Запуск деплоя

1. Нажмите "Create Web Service"
2. Дождитесь завершения сборки и деплоя
3. Получите URL вашего API (например: `https://your-app.onrender.com`)

## 🔧 После деплоя

### 1. Инициализация базы данных

После успешного деплоя выполните миграции:

```bash
# Через Render Dashboard → Shell
npx prisma migrate deploy
npm run db:seed
```

### 2. Создание администратора

Используйте один из способов создания администратора:

#### A. Через API endpoint:

```bash
curl -X POST https://your-app.onrender.com/api/v1/auth/internal/init-admin \
  -H "Content-Type: application/json" \
  -H "x-init-token: your-super-secret-init-token-here" \
  -d '{
    "email": "rrustamov986@gmail.com",
    "password": "Rrustamov9864"
  }'
```

#### B. Через seed скрипт:

```bash
# В Render Dashboard → Shell
npm run db:seed
```

### 3. Проверка работоспособности

```bash
# Health check
curl https://your-app.onrender.com/health

# API documentation
curl https://your-app.onrender.com/api/docs

# Login test
curl -X POST https://your-app.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rrustamov986@gmail.com",
    "password": "Rrustamov9864"
  }'
```

## 🔐 Безопасность

### 1. Переменные окружения

- ✅ Никогда не коммитьте `.env` файлы
- ✅ Используйте криптографически стойкие секреты
- ✅ Регулярно меняйте пароли и токены

### 2. CORS настройки

Убедитесь, что CORS настроен только для вашего фронтенда:

```typescript
const allowedOrigins = [
  'https://ruslan9864.github.io',
  'http://localhost:3000', // для разработки
];
```

### 3. Rate Limiting

Render автоматически применяет rate limiting, но вы можете настроить дополнительные ограничения в коде.

## 📊 Мониторинг

### 1. Логи

- Просматривайте логи в Render Dashboard
- Настройте алерты на ошибки

### 2. Метрики

- Мониторьте использование ресурсов
- Следите за временем отклика

### 3. Health Checks

Используйте встроенные health checks:

```bash
curl https://your-app.onrender.com/health
```

## 🔄 Обновления

### 1. Автоматические деплои

Render автоматически деплоит изменения при push в основную ветку.

### 2. Ручные деплои

Можете запустить деплой вручную через Dashboard.

### 3. Rollback

В случае проблем можете откатиться к предыдущей версии.

## 🆘 Устранение неполадок

### Проблема: "Database connection failed"

1. Проверьте `DATABASE_URL` в переменных окружения
2. Убедитесь, что база данных доступна
3. Проверьте firewall настройки

### Проблема: "Build failed"

1. Проверьте логи сборки
2. Убедитесь, что все зависимости указаны в `package.json`
3. Проверьте синтаксис TypeScript

### Проблема: "CORS error"

1. Проверьте настройки CORS в коде
2. Убедитесь, что домен фронтенда добавлен в `allowedOrigins`

## 📝 Полезные команды

```bash
# Проверка статуса
curl https://your-app.onrender.com/health

# Тест аутентификации
curl -X POST https://your-app.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rrustamov986@gmail.com", "password": "Rrustamov9864"}'

# Создание пользователя (требует JWT токен)
curl -X POST https://your-app.onrender.com/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email": "user@example.com", "password": "password123", "role": "AUTHOR"}'
```

## 🎯 Результат

После успешного деплоя у вас будет:

- ✅ Работающий API на `https://your-app.onrender.com`
- ✅ Swagger документация на `/api/docs`
- ✅ Health checks на `/health`
- ✅ Созданный администратор
- ✅ Настроенная база данных
- ✅ Безопасные переменные окружения

Теперь можете обновить `API_BASE_URL` в вашей админке на GitHub Pages на новый URL!
