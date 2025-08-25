# Admin Panel для Блога - Документация

## Обзор

Админ-панель для управления блогом студии RHYTHM представляет собой полнофункциональную систему управления контентом (CMS) с современным интерфейсом, поддержкой SEO, безопасностью и доступностью.

## Основные возможности

### 🔐 Аутентификация и безопасность
- JWT-based аутентификация
- Роли пользователей (Admin, Editor, Author, Viewer)
- Безопасная загрузка файлов (OWASP compliance)
- Защита от XSS и CSRF атак
- Валидация входных данных

### 📝 Управление контентом
- Создание и редактирование статей
- WYSIWYG редактор с поддержкой Markdown
- Автосохранение черновиков
- Система версионирования
- Публикация по расписанию

### 🖼️ Медиа-библиотека
- Загрузка изображений и документов
- Автоматическая генерация WebP/AVIF
- Удаление EXIF данных
- Создание превью
- Валидация alt-текста

### 🔍 SEO и оптимизация
- Мета-теги и Open Graph
- Структурированные данные (JSON-LD)
- Автогенерация sitemap.xml
- RSS-лента
- Валидация длины заголовков и описаний

### ♿ Доступность (WCAG 2.1)
- Высокий контраст (4.5:1)
- Поддержка клавиатурной навигации
- ARIA-метки
- Фокус-стили
- Семантическая разметка

## Структура файлов

```
admin/
├── index.html              # Главная страница админ-панели
├── admin-styles.css        # Стили с WCAG 2.1 compliance
├── admin-auth.js           # Система аутентификации
├── admin-dashboard.js      # Дашборд и статистика
├── admin-posts.js          # Управление статьями
├── admin-media.js          # Медиа-библиотека
└── admin-main.js           # Основная логика
```

## Установка и настройка

### 1. Подготовка сервера

#### Требования
- Node.js 18+ или PHP 8.0+
- База данных (MySQL/PostgreSQL)
- HTTPS сертификат
- Минимум 512MB RAM

#### Настройка безопасности
```bash
# Установка заголовков безопасности
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### 2. Настройка базы данных

#### Схема таблиц
```sql
-- Пользователи
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'author', 'viewer') DEFAULT 'viewer',
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Статьи
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('draft', 'review', 'scheduled', 'published', 'archived') DEFAULT 'draft',
    language ENUM('ru', 'en') DEFAULT 'ru',
    summary TEXT,
    content LONGTEXT,
    hero_image_id INT,
    author_id INT NOT NULL,
    published_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (hero_image_id) REFERENCES media_assets(id)
);

-- SEO данные
CREATE TABLE post_seo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    og_title VARCHAR(60),
    og_description VARCHAR(160),
    og_image VARCHAR(255),
    robots VARCHAR(50) DEFAULT 'index,follow',
    canonical_url VARCHAR(255),
    structured_data JSON,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Медиа файлы
CREATE TABLE media_assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    alt_text VARCHAR(255),
    title VARCHAR(255),
    caption TEXT,
    dimensions JSON,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Категории
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Теги
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связи статей с категориями и тегами
CREATE TABLE post_categories (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- FAQ блоки
CREATE TABLE post_faq (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Видео вставки
CREATE TABLE post_videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    caption TEXT,
    order_index INT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Аудит действий
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. Настройка API

#### Конфигурация JWT
```javascript
// config/jwt.js
module.exports = {
    secret: process.env.JWT_SECRET || 'your-super-secret-key',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
};
```

#### Middleware для аутентификации
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
};

const checkPermission = (permission) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const permissions = {
            admin: ['all'],
            editor: ['create', 'edit', 'publish', 'delete_own'],
            author: ['create', 'edit_own', 'submit_review'],
            viewer: ['view']
        };

        const userPermissions = permissions[userRole] || [];
        
        if (userPermissions.includes('all') || userPermissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ message: 'Недостаточно прав' });
        }
    };
};
```

### 4. Настройка загрузки файлов

#### Валидация файлов (OWASP)
```javascript
// middleware/fileUpload.js
const multer = require('multer');
const path = require('path');

const allowedMimes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/avif': '.avif',
    'application/pdf': '.pdf'
};

const fileFilter = (req, file, cb) => {
    // Проверка MIME типа
    if (!allowedMimes[file.mimeType]) {
        return cb(new Error('Неподдерживаемый тип файла'), false);
    }

    // Проверка расширения
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes[file.mimeType] !== ext) {
        return cb(new Error('Несоответствие расширения файла'), false);
    }

    // Проверка размера (10MB)
    if (file.size > 10 * 1024 * 1024) {
        return cb(new Error('Файл слишком большой'), false);
    }

    cb(null, true);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads', new Date().getFullYear().toString());
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Генерация случайного имени
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + allowedMimes[file.mimeType]);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
```

## Использование

### 1. Вход в систему

1. Откройте `/admin/` в браузере
2. Введите email и пароль
3. При необходимости включите "Запомнить меня"

### 2. Создание статьи

1. Нажмите "Новая статья" или используйте `Ctrl+N`
2. Заполните обязательные поля:
   - Заголовок (60-80 символов)
   - Краткое описание (140-160 символов)
   - Содержание
3. Настройте SEO параметры
4. Выберите категории и теги
5. Сохраните как черновик или опубликуйте

### 3. Загрузка медиа

1. Перейдите в раздел "Медиа"
2. Нажмите "Загрузить медиа" или используйте `Ctrl+U`
3. Перетащите файлы или выберите их
4. Настройте параметры загрузки
5. Дождитесь завершения загрузки

### 4. Горячие клавиши

- `Ctrl+K` - Быстрый поиск
- `Ctrl+N` - Новая статья
- `Ctrl+U` - Загрузить медиа
- `Alt+1-7` - Навигация по разделам
- `Escape` - Закрыть модальные окна

## SEO и структурированные данные

### Автоматическая генерация

Система автоматически генерирует:

1. **Meta теги**
```html
<meta name="title" content="Заголовок статьи">
<meta name="description" content="Краткое описание">
<meta name="robots" content="index,follow">
```

2. **Open Graph**
```html
<meta property="og:title" content="Заголовок">
<meta property="og:description" content="Описание">
<meta property="og:image" content="URL изображения">
<meta property="og:type" content="article">
```

3. **JSON-LD структурированные данные**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Заголовок статьи",
  "author": {
    "@type": "Person",
    "name": "Имя автора"
  },
  "datePublished": "2024-01-20T10:00:00Z",
  "image": "URL изображения",
  "publisher": {
    "@type": "Organization",
    "name": "RHYTHM Studio"
  }
}
```

### RSS и Sitemap

Система автоматически генерирует:

- `rss.xml` - RSS-лента для подписчиков
- `sitemap.xml` - Карта сайта для поисковых систем

## Безопасность

### OWASP Top 10 защита

1. **Injection** - Параметризованные запросы
2. **Broken Authentication** - JWT с истечением срока
3. **Sensitive Data Exposure** - HTTPS, шифрование
4. **XML External Entities** - Отключение XXE
5. **Broken Access Control** - Проверка прав доступа
6. **Security Misconfiguration** - Безопасные заголовки
7. **Cross-Site Scripting** - Валидация и экранирование
8. **Insecure Deserialization** - Валидация JSON
9. **Using Components with Known Vulnerabilities** - Регулярные обновления
10. **Insufficient Logging & Monitoring** - Аудит действий

### Загрузка файлов

- Белый список MIME типов
- Проверка расширений
- Ограничение размера
- Случайные имена файлов
- Изоляция директорий
- Удаление EXIF данных

## Производительность

### Core Web Vitals

- **LCP (Largest Contentful Paint)** < 2.5s
- **FID (First Input Delay)** < 100ms
- **CLS (Cumulative Layout Shift)** < 0.1

### Оптимизация

1. **Изображения**
   - Автоматическая генерация WebP/AVIF
   - Ленивая загрузка
   - Responsive images

2. **JavaScript**
   - Минификация
   - Tree shaking
   - Code splitting

3. **CSS**
   - Критический CSS
   - Минификация
   - PurgeCSS

## Мониторинг и аналитика

### Логирование

```javascript
// middleware/audit.js
const auditLog = (action, entityType, entityId, details) => {
    return {
        user_id: req.user?.id,
        action: action,
        entity_type: entityType,
        entity_id: entityId,
        details: details,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        created_at: new Date()
    };
};
```

### Метрики

- Время загрузки страниц
- Количество созданных статей
- Популярные категории
- Ошибки системы
- Активность пользователей

## Развертывание

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Nginx конфигурация

```nginx
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /uploads/ {
        alias /var/www/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Обновления и поддержка

### Регулярные обновления

1. **Безопасность** - Ежемесячные обновления зависимостей
2. **Функциональность** - Квартальные релизы
3. **Производительность** - Постоянный мониторинг

### Резервное копирование

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/admin"

# Database backup
mysqldump -u username -p database > $BACKUP_DIR/db_$DATE.sql

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/uploads/

# Keep only last 30 backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## Заключение

Админ-панель предоставляет полный набор инструментов для управления блогом с учетом современных требований к безопасности, производительности и доступности. Система готова к продакшн использованию и может быть легко расширена дополнительными функциями.

---

**Версия документации:** 1.0  
**Дата последнего обновления:** 2024-01-20  
**Автор:** RHYTHM Studio Development Team
