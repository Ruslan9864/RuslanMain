# Blog Admin Backend

Полноценный backend для админ-панели блога с поддержкой NestJS, PostgreSQL, Redis и S3-совместимого хранилища.

## 🏗️ Архитектура

- **Ядро**: Node.js + NestJS (модульность, guards, pipes, DI)
- **БД**: PostgreSQL 14+ (UUID PK, timezone UTC)
- **ORM**: Prisma
- **Кэш/очереди**: Redis + BullMQ
- **Файлы**: S3-совместимое хранилище (MinIO для разработки)
- **Аутентификация**: JWT + OIDC (Google)
- **Безопасность**: OWASP, bcrypt, rate limiting
- **Документация**: OpenAPI 3.1 (Swagger)

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (или Docker)
- Redis (или Docker)

### 1. Клонирование и установка

```bash
cd backend
npm install
```

### 2. Настройка окружения

```bash
cp env.example .env
```

Отредактируйте `.env` файл с вашими настройками:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blog_admin?schema=public"

# JWT (сгенерируйте безопасные ключи)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# S3 (MinIO для разработки)
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET="blog-admin"
S3_ENDPOINT="http://localhost:9000"
```

### 3. Запуск с Docker Compose (рекомендуется)

```bash
# Запуск всей инфраструктуры
docker-compose up -d

# Инициализация базы данных
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

### 4. Запуск без Docker

```bash
# Установка зависимостей
npm install

# Генерация Prisma клиента
npm run prisma:generate

# Миграции базы данных
npm run prisma:migrate

# Заполнение начальными данными
npm run db:seed

# Запуск в режиме разработки
npm run start:dev
```

## 📊 Доступные сервисы

После запуска будут доступны:

- **API**: http://localhost:3000
- **Swagger документация**: http://localhost:3000/api/docs
- **Health check**: http://localhost:3000/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001 (admin/admin)

## 🔐 Учетная запись администратора

После выполнения `npm run db:seed` будет создана учетная запись:

- **Email**: `rrustamov986@gmail.com`
- **Пароль**: `Rrustamov9864`
- **Роль**: `ADMIN`

## 📚 API Endpoints

### Аутентификация

- `POST /api/v1/auth/login` - Вход с email/password
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/refresh` - Обновление токена
- `POST /api/v1/auth/logout` - Выход
- `GET /api/v1/auth/me` - Профиль пользователя
- `GET /api/v1/auth/google` - OIDC вход через Google

### Посты

- `GET /api/v1/posts` - Список постов
- `POST /api/v1/posts` - Создание поста
- `GET /api/v1/posts/:id` - Получение поста
- `PATCH /api/v1/posts/:id` - Обновление поста
- `DELETE /api/v1/posts/:id` - Удаление поста
- `POST /api/v1/posts/:id/publish` - Публикация поста
- `POST /api/v1/posts/:id/schedule` - Планирование поста

### Медиа

- `POST /api/v1/media/presign` - Получение presigned URL для загрузки
- `POST /api/v1/media/confirm` - Подтверждение загрузки
- `GET /api/v1/media/:id` - Получение медиафайла
- `DELETE /api/v1/media/:id` - Удаление медиафайла

### SEO и фиды

- `GET /api/v1/sitemap.xml` - Sitemap
- `GET /api/v1/rss.xml` - RSS feed
- `POST /api/v1/preview-token` - Создание токена предпросмотра

## 🛡️ Безопасность

### OWASP Compliance

- ✅ Валидация файлов (MIME, размер, расширение)
- ✅ JWT с коротким сроком жизни
- ✅ Refresh token rotation
- ✅ Rate limiting
- ✅ CORS настройки
- ✅ Security headers (Helmet)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection

### Роли и разрешения

- **ADMIN**: Полный доступ ко всем функциям
- **EDITOR**: CRUD контента, публикация
- **AUTHOR**: CRUD своих постов, отправка на ревью
- **VIEWER**: Только просмотр

## 📁 Структура проекта

```
backend/
├── src/
│   ├── auth/           # Аутентификация и авторизация
│   ├── users/          # Управление пользователями
│   ├── posts/          # Управление постами
│   ├── media/          # Управление медиафайлами
│   ├── categories/     # Категории
│   ├── tags/           # Теги
│   ├── seo/            # SEO и фиды
│   ├── webhooks/       # Вебхуки
│   ├── health/         # Health checks
│   └── prisma/         # База данных
├── prisma/
│   ├── schema.prisma   # Схема базы данных
│   └── seed.ts         # Начальные данные
├── docker-compose.yml  # Docker инфраструктура
└── env.example         # Пример конфигурации
```

## 🔧 Разработка

### Команды

```bash
# Разработка
npm run start:dev

# Сборка
npm run build

# Продакшн
npm run start:prod

# Тесты
npm run test
npm run test:e2e

# Линтинг
npm run lint
npm run format

# База данных
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed
```

### Добавление новых миграций

```bash
# Создание миграции
npx prisma migrate dev --name add_new_feature

# Применение миграций в продакшне
npx prisma migrate deploy
```

## 🚀 Развертывание

### Docker

```bash
# Сборка и запуск
docker-compose up -d --build

# Логи
docker-compose logs -f api

# Остановка
docker-compose down
```

### Продакшн

1. Настройте переменные окружения для продакшна
2. Используйте реальный S3 или совместимое хранилище
3. Настройте SSL сертификаты
4. Настройте мониторинг (Prometheus/Grafana)
5. Настройте бэкапы PostgreSQL

## 📊 Мониторинг

- **Health checks**: `/health`
- **Логирование**: Pino
- **Метрики**: Prometheus (готово к интеграции)
- **Аудит**: Все действия логируются в `audit_logs`

## 🔗 Интеграции

- **Google OIDC**: Настройте в Google Cloud Console
- **S3**: AWS S3, MinIO, Wasabi, Backblaze
- **CDN**: Cloudflare, AWS CloudFront
- **Email**: SendGrid, AWS SES (для уведомлений)

## 📝 Лицензия

MIT
