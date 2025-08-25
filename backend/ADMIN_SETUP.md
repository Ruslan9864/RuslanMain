# Создание администратора - Подробная инструкция

Этот документ описывает все способы создания администраторской учетной записи в системе.

## 🔐 Безопасность

Все методы создания администратора соответствуют требованиям безопасности:

- ✅ Пароли не хранятся в коде
- ✅ Используется bcrypt для хеширования
- ✅ Проверка существования пользователя
- ✅ Audit logging без паролей
- ✅ Защищенные endpoints

## 📋 Способы создания администратора

### 1. Seed скрипт (рекомендуется для разработки)

Самый простой способ для разработки и первоначальной настройки.

#### Настройка переменных окружения

```bash
# В файле .env
ADMIN_EMAIL="rrustamov986@gmail.com"
ADMIN_PASSWORD="Rrustamov9864"
ADMIN_NAME="Rustam Rustamov"
```

#### Запуск

```bash
# Стандартный запуск
npm run db:seed

# С кастомными параметрами
ADMIN_EMAIL="your@email.com" ADMIN_PASSWORD="yourpassword" npm run db:seed
```

#### Особенности

- ✅ Автоматически создает администратора при первом запуске
- ✅ Проверяет существование пользователя
- ✅ Создает таблицу `seed_executions` для отслеживания
- ✅ Выводит учетные данные в консоль
- ⚠️ Предупреждает о использовании дефолтного пароля

### 2. CLI утилита (для DevOps)

Удобный способ для автоматизации и CI/CD.

#### Установка зависимостей

```bash
npm install yargs
```

#### Использование

```bash
# Интерактивный режим
npm run create-admin -- --interactive

# С параметрами
npm run create-admin -- --email="your@email.com" --password="yourpassword" --name="Your Name"

# Помощь
npm run create-admin -- --help
```

#### Примеры

```bash
# Создание с минимальными параметрами
npm run create-admin -- --email="admin@example.com" --password="SecurePass123"

# С полными параметрами
npm run create-admin -- --email="admin@example.com" --password="SecurePass123" --name="John Doe"

# Интерактивный режим
npm run create-admin -- --interactive
```

#### Особенности

- ✅ Валидация email и пароля
- ✅ Интерактивный режим
- ✅ Подробный вывод информации
- ✅ Обработка ошибок
- ✅ Graceful shutdown

### 3. API endpoint (для production)

Самый безопасный способ для production окружения.

#### Настройка

```bash
# В файле .env
INIT_ADMIN_TOKEN="your-super-secret-init-token-here"
```

#### Использование

```bash
curl -X POST http://localhost:3000/api/v1/auth/internal/init-admin \
  -H "Content-Type: application/json" \
  -H "x-init-token: your-super-secret-init-token-here" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123"
  }'
```

#### Ответ

```json
{
  "success": true,
  "message": "Администратор admin@example.com успешно создан"
}
```

#### Особенности

- ✅ Защищен секретным токеном
- ✅ Одноразовое использование (токен инвалидируется)
- ✅ Rate limiting
- ✅ Audit logging с IP адресом
- ✅ Валидация через DTO

## 🔧 Техническая реализация

### Структура файлов

```
backend/
├── src/auth/
│   ├── dto/init-admin.dto.ts      # Валидация данных
│   ├── guards/init-admin.guard.ts # Защита endpoint
│   ├── auth.service.ts            # Логика создания
│   └── auth.controller.ts         # API endpoint
├── prisma/
│   └── seed.ts                    # Seed скрипт
├── scripts/
│   └── create-admin.js            # CLI утилита
└── env.example                    # Переменные окружения
```

### База данных

#### Таблица seed_executions

```sql
CREATE TABLE seed_executions (
  id SERIAL PRIMARY KEY,
  seed_name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'success'
);
```

#### Audit logging

Все действия создания администратора логируются в таблицу `audit_logs`:

```sql
INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
VALUES (
  'admin-id',
  'INIT_ADMIN',
  'USER',
  'admin-id',
  '{"method": "init-admin", "ipAddress": "127.0.0.1", "email": "admin@example.com"}'
);
```

## 🚀 Production развертывание

### 1. Настройка переменных окружения

```bash
# Обязательные
INIT_ADMIN_TOKEN="your-super-secret-init-token-here"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Опциональные (для seed)
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="Admin Name"
```

### 2. Создание администратора

```bash
# Способ 1: API endpoint (рекомендуется)
curl -X POST https://yourdomain.com/api/v1/auth/internal/init-admin \
  -H "Content-Type: application/json" \
  -H "x-init-token: your-super-secret-init-token-here" \
  -d '{"email": "admin@yourdomain.com", "password": "SecurePass123"}'

# Способ 2: CLI утилита
npm run create-admin -- --email="admin@yourdomain.com" --password="SecurePass123"

# Способ 3: Seed скрипт
ADMIN_EMAIL="admin@yourdomain.com" ADMIN_PASSWORD="SecurePass123" npm run db:seed
```

### 3. Безопасность

- ✅ Измените INIT_ADMIN_TOKEN после создания администратора
- ✅ Используйте HTTPS в production
- ✅ Настройте firewall для ограничения доступа к API
- ✅ Мониторьте audit logs
- ✅ Регулярно меняйте пароли

## 🔍 Мониторинг и логирование

### Audit logs

Все действия создания администратора логируются:

```json
{
  "action": "INIT_ADMIN",
  "resource": "USER",
  "details": {
    "method": "init-admin",
    "ipAddress": "192.168.1.100",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### Проверка создания

```bash
# Проверка через API
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Проверка в базе данных
SELECT id, email, role, created_at FROM users WHERE role = 'ADMIN';
```

## ❗ Важные замечания

1. **Пароли**: Никогда не храните пароли в коде или репозитории
2. **Токены**: Используйте криптографически стойкие токены
3. **Логи**: Не логируйте пароли или токены
4. **Доступ**: Ограничьте доступ к endpoint создания администратора
5. **Мониторинг**: Настройте алерты на создание администраторов

## 🆘 Устранение неполадок

### Проблема: "User already exists"

```bash
# Проверьте существующих пользователей
SELECT email, role FROM users WHERE email = 'your@email.com';

# Удалите пользователя (если нужно)
DELETE FROM users WHERE email = 'your@email.com';
```

### Проблема: "Invalid init token"

```bash
# Проверьте переменную окружения
echo $INIT_ADMIN_TOKEN

# Перезапустите приложение
npm run start:dev
```

### Проблема: "Database connection failed"

```bash
# Проверьте подключение к базе
npm run prisma:studio

# Проверьте переменную DATABASE_URL
echo $DATABASE_URL
```
