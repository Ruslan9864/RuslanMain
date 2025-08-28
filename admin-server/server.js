const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Импорт роутов
const postsRouter = require('./routes/posts');
const mediaRouter = require('./routes/media');
const generateRouter = require('./routes/generate');
const previewRouter = require('./routes/preview');

const app = express();
const PORT = process.env.PORT || 7777;

// Безопасность - слушаем только localhost
const HOST = '127.0.0.1';

// Middleware безопасности
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - разрешаем только localhost
app.use(cors({
  origin: ['http://localhost:7777', 'http://127.0.0.1:7777'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 1000, // максимум 1000 запросов с одного IP
  message: 'Too many requests from this IP',
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 минут
  delayAfter: 100, // начинаем замедлять после 100 запросов
  delayMs: 500, // добавляем 500ms задержки за каждый запрос
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Логирование
app.use(morgan('combined'));

// Сжатие
app.use(compression());

// Парсинг JSON
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// API роуты
app.use('/api/posts', postsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/generate', generateRouter);
app.use('/api/preview', previewRouter);

// Главная страница админки
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('./package.json').version
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Инициализация директорий при запуске
async function initializeDirectories() {
  const dirs = [
    'blog',
    'blog/.drafts',
    'blog/.versions',
    'build',
    'build/blog',
    'templates',
    'templates/partials',
    'public/uploads',
    'public/uploads/covers',
    'public/uploads/media'
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(__dirname, '..', dir));
  }

  // Создаем базовые файлы если их нет
  const files = [
    { path: 'blog/index.json', content: '[]' },
    { path: 'blog/tags.json', content: '{}' },
    { path: 'templates/post.html', content: getDefaultPostTemplate() },
    { path: 'templates/list.html', content: getDefaultListTemplate() },
    { path: 'templates/partials/header.html', content: getDefaultHeaderTemplate() },
    { path: 'templates/partials/footer.html', content: getDefaultFooterTemplate() }
  ];

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file.path);
    if (!await fs.pathExists(filePath)) {
      await fs.writeFile(filePath, file.content, 'utf8');
    }
  }
}

function getDefaultPostTemplate() {
  return `<!DOCTYPE html>
<html lang="{{locale}}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{seo.title}}</title>
    <meta name="description" content="{{seo.description}}">
    <meta property="og:title" content="{{seo.title}}">
    <meta property="og:description" content="{{seo.description}}">
    <meta property="og:image" content="{{seo.ogImage}}">
    <meta property="og:type" content="article">
    <link rel="canonical" href="{{canonical}}">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    {{> header}}
    
    <main class="container">
        <article class="post">
            <header class="post-header">
                <h1>{{title}}</h1>
                <div class="post-meta">
                    <time datetime="{{date}}">{{formattedDate}}</time>
                    <span class="reading-time">{{readingTime}} мин чтения</span>
                </div>
                <div class="post-tags">
                    {{#each tags}}
                    <span class="tag">{{this}}</span>
                    {{/each}}
                </div>
            </header>
            
            <div class="post-content">
                {{{content}}}
            </div>
        </article>
    </main>
    
    {{> footer}}
</body>
</html>`;
}

function getDefaultListTemplate() {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Блог</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    {{> header}}
    
    <main class="container">
        <h1>Блог</h1>
        <div class="posts-grid" id="posts-container">
            <!-- Посты будут загружены через JavaScript -->
        </div>
    </main>
    
    {{> footer}}
    
    <script>
        // Загрузка постов из index.json
        fetch('/blog/index.json')
            .then(response => response.json())
            .then(posts => {
                const container = document.getElementById('posts-container');
                posts.forEach(post => {
                    const article = document.createElement('article');
                    article.className = 'post-card';
                    article.innerHTML = \`
                        <h2><a href="/blog/\${post.slug}">\${post.title}</a></h2>
                        <p>\${post.summary}</p>
                        <div class="post-meta">
                            <time>\${new Date(post.date).toLocaleDateString()}</time>
                            <span>\${post.readingTime} мин</span>
                        </div>
                    \`;
                    container.appendChild(article);
                });
            });
    </script>
</body>
</html>`;
}

function getDefaultHeaderTemplate() {
  return `<header class="site-header">
    <nav class="nav">
        <a href="/" class="logo">Логотип</a>
        <ul class="nav-menu">
            <li><a href="/">Главная</a></li>
            <li><a href="/blog">Блог</a></li>
            <li><a href="/about">О нас</a></li>
            <li><a href="/contact">Контакты</a></li>
        </ul>
    </nav>
</header>`;
}

function getDefaultFooterTemplate() {
  return `<footer class="site-footer">
    <div class="container">
        <p>&copy; 2025 Все права защищены</p>
    </div>
</footer>`;
}

// Запуск сервера
async function startServer() {
  try {
    await initializeDirectories();
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Blog Admin Server запущен на http://${HOST}:${PORT}`);
      console.log(`📝 Админ-панель: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API документация: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();
