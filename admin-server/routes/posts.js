const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const {
  readPost,
  writePost,
  createBackup,
  validateFrontmatter,
  updateIndexJson,
  updateTagsJson,
  checkSlugDuplicate,
  checkBrokenImages,
  autoFillFrontmatter,
  generateSlug,
  formatDate,
  BLOG_ROOT
} = require('../utils/blogUtils');

const router = express.Router();

// GET /api/posts - список постов с фильтрацией
router.get('/', async (req, res) => {
  try {
    const {
      status,
      tag,
      q,
      locale,
      from,
      to,
      page = 1,
      limit = 20
    } = req.query;

    const posts = [];
    const years = await fs.readdir(BLOG_ROOT);

    // Сканируем все посты
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

            // Фильтрация по статусу
            if (status && frontmatter.status !== status) {
              continue;
            }

            // Фильтрация по тегу
            if (tag && (!frontmatter.tags || !frontmatter.tags.includes(tag))) {
              continue;
            }

            // Фильтрация по языку
            if (locale && frontmatter.locale !== locale) {
              continue;
            }

            // Фильтрация по дате
            if (from && new Date(frontmatter.date) < new Date(from)) {
              continue;
            }

            if (to && new Date(frontmatter.date) > new Date(to)) {
              continue;
            }

            // Поиск по тексту
            if (q) {
              const searchText = `${frontmatter.title} ${frontmatter.summary} ${frontmatter.tags?.join(' ')}`.toLowerCase();
              if (!searchText.includes(q.toLowerCase())) {
                continue;
              }
            }

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
          } catch (error) {
            console.error(`Error reading post ${year}/${month}/${slug}:`, error);
          }
        }
      }
    }

    // Сортировка по дате (новые сначала)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.json({
      posts: paginatedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length,
        pages: Math.ceil(posts.length / limit)
      }
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// GET /api/posts/:year/:month/:slug - получить пост
router.get('/:year/:month/:slug', async (req, res) => {
  try {
    const { year, month, slug } = req.params;
    const { frontmatter, markdown } = await readPost(year, month, slug);

    // Проверяем broken images
    const brokenImages = checkBrokenImages(markdown, path.join(BLOG_ROOT, year, month, slug));

    res.json({
      frontmatter,
      markdown,
      brokenImages
    });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(404).json({ error: 'Post not found' });
  }
});

// POST /api/posts - создать пост
router.post('/', async (req, res) => {
  try {
    const { frontmatter, markdown } = req.body;

    // Валидация
    const errors = validateFrontmatter(frontmatter);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Автозаполнение
    const filledFrontmatter = autoFillFrontmatter(frontmatter, markdown);

    // Генерация slug если не указан
    if (!filledFrontmatter.slug) {
      filledFrontmatter.slug = generateSlug(filledFrontmatter.title);
    }

    // Определение года и месяца из даты
    const date = moment.tz(filledFrontmatter.date, 'Asia/Tashkent');
    const year = date.format('YYYY');
    const month = date.format('MM');

    // Проверка дубликатов
    const isDuplicate = await checkSlugDuplicate(year, month, filledFrontmatter.slug);
    if (isDuplicate) {
      return res.status(409).json({ error: 'Post with this slug already exists' });
    }

    // Запись поста
    const { path: postPath } = await writePost(year, month, filledFrontmatter.slug, filledFrontmatter, markdown);

    // Создание резервной копии если публикуем
    if (filledFrontmatter.status === 'published') {
      await createBackup(year, month, filledFrontmatter.slug);
    }

    // Обновление index.json и tags.json
    await updateIndexJson();
    await updateTagsJson();

    res.status(201).json({
      message: 'Post created successfully',
      path: `${year}/${month}/${filledFrontmatter.slug}`,
      postPath
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/posts/:year/:month/:slug - обновить пост
router.put('/:year/:month/:slug', async (req, res) => {
  try {
    const { year, month, slug } = req.params;
    const { frontmatter, markdown } = req.body;

    // Проверяем существование поста
    const existingPost = await readPost(year, month, slug);

    // Валидация
    const errors = validateFrontmatter(frontmatter);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Автозаполнение
    const filledFrontmatter = autoFillFrontmatter(frontmatter, markdown);

    // Проверяем, изменился ли slug
    const newSlug = filledFrontmatter.slug || slug;
    const newDate = moment.tz(filledFrontmatter.date, 'Asia/Tashkent');
    const newYear = newDate.format('YYYY');
    const newMonth = newDate.format('MM');

    let finalYear = year;
    let finalMonth = month;
    let finalSlug = slug;

    // Если изменилась дата или slug, перемещаем файл
    if (newYear !== year || newMonth !== month || newSlug !== slug) {
      // Проверяем дубликаты в новом месте
      const isDuplicate = await checkSlugDuplicate(newYear, newMonth, newSlug, path.join(BLOG_ROOT, year, month, slug));
      if (isDuplicate) {
        return res.status(409).json({ error: 'Post with this slug already exists' });
      }

      // Создаем резервную копию старого поста
      await createBackup(year, month, slug);

      // Удаляем старый пост
      await fs.remove(path.join(BLOG_ROOT, year, month, slug));

      finalYear = newYear;
      finalMonth = newMonth;
      finalSlug = newSlug;
    }

    // Запись поста
    const { path: postPath } = await writePost(finalYear, finalMonth, finalSlug, filledFrontmatter, markdown);

    // Создание резервной копии если публикуем
    if (filledFrontmatter.status === 'published') {
      await createBackup(finalYear, finalMonth, finalSlug);
    }

    // Обновление index.json и tags.json
    await updateIndexJson();
    await updateTagsJson();

    res.json({
      message: 'Post updated successfully',
      path: `${finalYear}/${finalMonth}/${finalSlug}`,
      postPath
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:year/:month/:slug - удалить пост
router.delete('/:year/:month/:slug', async (req, res) => {
  try {
    const { year, month, slug } = req.params;

    // Проверяем существование поста
    await readPost(year, month, slug);

    // Создаем резервную копию
    await createBackup(year, month, slug);

    // Перемещаем в trash
    const trashPath = path.join(BLOG_ROOT, '.trash', `${year}-${month}-${slug}-${Date.now()}`);
    const postPath = path.join(BLOG_ROOT, year, month, slug);
    
    await fs.move(postPath, trashPath);

    // Обновление index.json и tags.json
    await updateIndexJson();
    await updateTagsJson();

    res.json({
      message: 'Post deleted successfully',
      trashPath
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// GET /api/posts/drafts - получить черновики
router.get('/drafts', async (req, res) => {
  try {
    const draftsPath = path.join(BLOG_ROOT, '.drafts');
    const drafts = [];

    if (await fs.pathExists(draftsPath)) {
      const files = await fs.readdir(draftsPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(draftsPath, file);
          const content = await fs.readFile(filePath, 'utf8');
          const { data: frontmatter } = require('gray-matter')(content);
          
          drafts.push({
            filename: file,
            frontmatter,
            lastModified: (await fs.stat(filePath)).mtime
          });
        }
      }
    }

    res.json(drafts);
  } catch (error) {
    console.error('Error getting drafts:', error);
    res.status(500).json({ error: 'Failed to get drafts' });
  }
});

// POST /api/posts/drafts - сохранить черновик
router.post('/drafts', async (req, res) => {
  try {
    const { frontmatter, markdown } = req.body;
    const draftsPath = path.join(BLOG_ROOT, '.drafts');
    await fs.ensureDir(draftsPath);

    const timestamp = Date.now();
    const filename = `draft-${timestamp}.md`;
    const filePath = path.join(draftsPath, filename);

    const content = require('gray-matter').stringify(markdown, frontmatter);
    await fs.writeFile(filePath, content, 'utf8');

    res.json({
      message: 'Draft saved successfully',
      filename
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

module.exports = router;
