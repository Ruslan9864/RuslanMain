const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const slugify = require('slugify');
const moment = require('moment-timezone');
const marked = require('marked');
const hljs = require('highlight.js');

// Настройка marked для подсветки кода
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-'
});

// Константы
const BLOG_ROOT = path.join(__dirname, '..', '..', 'blog');
const BUILD_ROOT = path.join(__dirname, '..', '..', 'build');
const TEMPLATES_ROOT = path.join(__dirname, '..', '..', 'templates');
const TIMEZONE = 'Asia/Tashkent';
const WPM = 180; // слов в минуту для подсчета времени чтения

// Генерация slug из заголовка
function generateSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: 'ru'
  });
}

// Подсчет времени чтения
function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / WPM);
}

// Форматирование даты
function formatDate(date, format = 'YYYY-MM-DDTHH:mm:ssZ') {
  return moment.tz(date, TIMEZONE).format(format);
}

// Получение пути к посту
function getPostPath(year, month, slug) {
  return path.join(BLOG_ROOT, year.toString(), month.toString().padStart(2, '0'), slug);
}

// Чтение поста
async function readPost(year, month, slug) {
  const postPath = getPostPath(year, month, slug);
  const indexPath = path.join(postPath, 'index.md');
  
  if (!await fs.pathExists(indexPath)) {
    throw new Error('Post not found');
  }
  
  const content = await fs.readFile(indexPath, 'utf8');
  const { data: frontmatter, content: markdown } = matter(content);
  
  return {
    frontmatter,
    markdown,
    path: postPath,
    indexPath
  };
}

// Запись поста
async function writePost(year, month, slug, frontmatter, markdown) {
  const postPath = getPostPath(year, month, slug);
  await fs.ensureDir(postPath);
  
  const indexPath = path.join(postPath, 'index.md');
  const content = matter.stringify(markdown, frontmatter);
  
  await fs.writeFile(indexPath, content, 'utf8');
  
  return {
    path: postPath,
    indexPath
  };
}

// Создание резервной копии
async function createBackup(year, month, slug) {
  const postPath = getPostPath(year, month, slug);
  const versionsPath = path.join(postPath, '.versions');
  await fs.ensureDir(versionsPath);
  
  const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
  const backupPath = path.join(versionsPath, `${timestamp}.md`);
  
  const indexPath = path.join(postPath, 'index.md');
  if (await fs.pathExists(indexPath)) {
    await fs.copy(indexPath, backupPath);
  }
  
  return backupPath;
}

// Валидация frontmatter
function validateFrontmatter(frontmatter) {
  const errors = [];
  
  if (!frontmatter.title) {
    errors.push('Title is required');
  }
  
  if (!frontmatter.date) {
    errors.push('Date is required');
  }
  
  if (!frontmatter.author) {
    errors.push('Author is required');
  }
  
  if (!frontmatter.status) {
    errors.push('Status is required');
  }
  
  if (!['draft', 'scheduled', 'published', 'archived'].includes(frontmatter.status)) {
    errors.push('Invalid status');
  }
  
  if (!frontmatter.locale) {
    errors.push('Locale is required');
  }
  
  if (!['ru', 'uz', 'en'].includes(frontmatter.locale)) {
    errors.push('Invalid locale');
  }
  
  // SEO валидация
  if (frontmatter.seo) {
    if (frontmatter.seo.title && frontmatter.seo.title.length > 60) {
      errors.push('SEO title should be less than 60 characters');
    }
    
    if (frontmatter.seo.description && frontmatter.seo.description.length > 160) {
      errors.push('SEO description should be less than 160 characters');
    }
  }
  
  return errors;
}

// Обновление index.json
async function updateIndexJson() {
  const indexPath = path.join(BLOG_ROOT, 'index.json');
  const posts = [];
  
  // Сканируем все посты
  const years = await fs.readdir(BLOG_ROOT);
  
  for (const year of years) {
    if (year.startsWith('.') || !(await fs.stat(path.join(BLOG_ROOT, year))).isDirectory()) {
      continue;
    }
    
    const months = await fs.readdir(path.join(BLOG_ROOT, year));
    
    for (const month of months) {
      if (month.startsWith('.') || !(await fs.stat(path.join(BLOG_ROOT, year, month))).isDirectory()) {
        continue;
      }
      
      const slugs = await fs.readdir(path.join(BLOG_ROOT, year, month));
      
      for (const slug of slugs) {
        if (slug.startsWith('.') || !(await fs.stat(path.join(BLOG_ROOT, year, month, slug))).isDirectory()) {
          continue;
        }
        
        try {
          const { frontmatter } = await readPost(year, month, slug);
          
          // Добавляем только опубликованные посты
          if (frontmatter.status === 'published') {
            posts.push({
              title: frontmatter.title,
              slug: `${year}/${month}/${slug}`,
              date: frontmatter.date,
              updated: frontmatter.updated || frontmatter.date,
              summary: frontmatter.summary,
              tags: frontmatter.tags || [],
              cover: frontmatter.cover,
              readingTime: frontmatter.readingTime,
              locale: frontmatter.locale,
              status: frontmatter.status,
              author: frontmatter.author,
              canonical: frontmatter.canonical
            });
          }
        } catch (error) {
          console.error(`Error reading post ${year}/${month}/${slug}:`, error);
        }
      }
    }
  }
  
  // Сортируем по дате (новые сначала)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  await fs.writeFile(indexPath, JSON.stringify(posts, null, 2), 'utf8');
  
  return posts;
}

// Обновление tags.json
async function updateTagsJson() {
  const tagsPath = path.join(BLOG_ROOT, 'tags.json');
  const indexPath = path.join(BLOG_ROOT, 'index.json');
  
  if (!await fs.pathExists(indexPath)) {
    await fs.writeFile(tagsPath, '{}', 'utf8');
    return {};
  }
  
  const posts = JSON.parse(await fs.readFile(indexPath, 'utf8'));
  const tags = {};
  
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        if (!tags[tag]) {
          tags[tag] = {
            count: 0,
            posts: []
          };
        }
        tags[tag].count++;
        tags[tag].posts.push(post.slug);
      });
    }
  });
  
  await fs.writeFile(tagsPath, JSON.stringify(tags, null, 2), 'utf8');
  
  return tags;
}

// Проверка дубликатов slug
async function checkSlugDuplicate(year, month, slug, excludePath = null) {
  const postPath = getPostPath(year, month, slug);
  
  if (excludePath && postPath === excludePath) {
    return false;
  }
  
  return await fs.pathExists(postPath);
}

// Проверка broken images в markdown
function checkBrokenImages(markdown, postPath) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;
  
  while ((match = imageRegex.exec(markdown)) !== null) {
    const alt = match[1];
    const src = match[2];
    
    if (!src.startsWith('http') && !src.startsWith('//')) {
      const imagePath = path.resolve(postPath, src);
      images.push({
        alt,
        src,
        path: imagePath,
        exists: fs.pathExistsSync(imagePath)
      });
    }
  }
  
  return images;
}

// Генерация canonical URL
function generateCanonicalUrl(slug, baseUrl = 'https://ruslan9864.github.io') {
  return `${baseUrl}/blog/${slug}`;
}

// Автоматическое заполнение frontmatter
function autoFillFrontmatter(frontmatter, markdown) {
  const filled = { ...frontmatter };
  
  // Автоматическая дата публикации
  if (!filled.date) {
    filled.date = formatDate(new Date());
  }
  
  // Автоматическое время обновления
  filled.updated = formatDate(new Date());
  
  // Автоматический подсчет времени чтения
  filled.readingTime = calculateReadingTime(markdown);
  
  // Автоматический canonical URL
  if (!filled.canonical && filled.slug) {
    filled.canonical = generateCanonicalUrl(filled.slug);
  }
  
  // Автоматический SEO title
  if (!filled.seo) {
    filled.seo = {};
  }
  
  if (!filled.seo.title && filled.title) {
    filled.seo.title = filled.title;
  }
  
  if (!filled.seo.description && filled.summary) {
    filled.seo.description = filled.summary;
  }
  
  return filled;
}

module.exports = {
  generateSlug,
  calculateReadingTime,
  formatDate,
  getPostPath,
  readPost,
  writePost,
  createBackup,
  validateFrontmatter,
  updateIndexJson,
  updateTagsJson,
  checkSlugDuplicate,
  checkBrokenImages,
  generateCanonicalUrl,
  autoFillFrontmatter,
  BLOG_ROOT,
  BUILD_ROOT,
  TEMPLATES_ROOT,
  TIMEZONE,
  WPM
};
