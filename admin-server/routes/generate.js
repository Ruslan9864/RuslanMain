const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const moment = require('moment-timezone');
const {
  readPost,
  updateIndexJson,
  updateTagsJson,
  BUILD_ROOT,
  TEMPLATES_ROOT,
  formatDate
} = require('../utils/blogUtils');

const router = express.Router();

// Простой шаблонизатор
function renderTemplate(template, data) {
  let result = template;
  
  // Замена переменных {{variable}}
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const keys = key.trim().split('.');
    let value = data;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return match; // Возвращаем оригинал если не найдено
      }
    }
    
    return value || '';
  });
  
  // Обработка циклов {{#each items}}...{{/each}}
  result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, template) => {
    const keys = key.trim().split('.');
    let array = data;
    
    for (const k of keys) {
      if (array && typeof array === 'object' && k in array) {
        array = array[k];
      } else {
        return '';
      }
    }
    
    if (!Array.isArray(array)) {
      return '';
    }
    
    return array.map(item => {
      let itemTemplate = template;
      itemTemplate = itemTemplate.replace(/\{\{this\}\}/g, item);
      itemTemplate = itemTemplate.replace(/\{\{([^}]+)\}\}/g, (m, k) => {
        const itemKeys = k.trim().split('.');
        let value = item;
        
        for (const itemKey of itemKeys) {
          if (value && typeof value === 'object' && itemKey in value) {
            value = value[itemKey];
          } else {
            return m;
          }
        }
        
        return value || '';
      });
      
      return itemTemplate;
    }).join('');
  });
  
  // Обработка партиалов {{> partial}}
  result = result.replace(/\{\{>\s*([^}]+)\s*\}\}/g, (match, partialName) => {
    const partialPath = path.join(TEMPLATES_ROOT, 'partials', `${partialName}.html`);
    if (fs.pathExistsSync(partialPath)) {
      return fs.readFileSync(partialPath, 'utf8');
    }
    return '';
  });
  
  return result;
}

// Генерация HTML для поста
async function generatePostHTML(year, month, slug) {
  try {
    const { frontmatter, markdown } = await readPost(year, month, slug);
    
    // Конвертируем markdown в HTML
    const content = marked(markdown);
    
    // Загружаем шаблон
    const templatePath = path.join(TEMPLATES_ROOT, 'post.html');
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Форматируем дату
    const formattedDate = moment.tz(frontmatter.date, 'Asia/Tashkent').format('DD MMMM YYYY');
    
    // Подготавливаем данные для шаблона
    const templateData = {
      ...frontmatter,
      content,
      formattedDate,
      locale: frontmatter.locale || 'ru'
    };
    
    // Рендерим шаблон
    const html = renderTemplate(template, templateData);
    
    // Создаем директорию для поста
    const postBuildPath = path.join(BUILD_ROOT, 'blog', year, month, slug);
    await fs.ensureDir(postBuildPath);
    
    // Записываем HTML файл
    const indexPath = path.join(postBuildPath, 'index.html');
    await fs.writeFile(indexPath, html, 'utf8');
    
    return {
      path: indexPath,
      url: `/blog/${year}/${month}/${slug}/`
    };
  } catch (error) {
    console.error(`Error generating HTML for ${year}/${month}/${slug}:`, error);
    throw error;
  }
}

// Генерация списка постов
async function generateListHTML() {
  try {
    // Загружаем шаблон
    const templatePath = path.join(TEMPLATES_ROOT, 'list.html');
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Загружаем данные постов
    const indexPath = path.join(path.dirname(BUILD_ROOT), 'blog', 'index.json');
    const posts = JSON.parse(await fs.readFile(indexPath, 'utf8'));
    
    // Подготавливаем данные для шаблона
    const templateData = {
      posts,
      total: posts.length
    };
    
    // Рендерим шаблон
    const html = renderTemplate(template, templateData);
    
    // Создаем директорию для списка
    const listBuildPath = path.join(BUILD_ROOT, 'blog');
    await fs.ensureDir(listBuildPath);
    
    // Записываем HTML файл
    const listPath = path.join(listBuildPath, 'index.html');
    await fs.writeFile(listPath, html, 'utf8');
    
    return {
      path: listPath,
      url: '/blog/'
    };
  } catch (error) {
    console.error('Error generating list HTML:', error);
    throw error;
  }
}

// POST /api/generate - генерация HTML и JSON
router.post('/', async (req, res) => {
  try {
    const { posts = [], generateList = true } = req.body;
    
    const results = {
      posts: [],
      list: null,
      index: null,
      tags: null
    };
    
    // Генерируем HTML для указанных постов
    for (const post of posts) {
      try {
        const [year, month, slug] = post.split('/');
        const result = await generatePostHTML(year, month, slug);
        results.posts.push({
          post,
          ...result
        });
      } catch (error) {
        results.posts.push({
          post,
          error: error.message
        });
      }
    }
    
    // Обновляем index.json
    try {
      const indexPosts = await updateIndexJson();
      results.index = {
        posts: indexPosts.length,
        path: path.join(path.dirname(BUILD_ROOT), 'blog', 'index.json')
      };
    } catch (error) {
      results.index = { error: error.message };
    }
    
    // Обновляем tags.json
    try {
      const tags = await updateTagsJson();
      results.tags = {
        tags: Object.keys(tags).length,
        path: path.join(path.dirname(BUILD_ROOT), 'blog', 'tags.json')
      };
    } catch (error) {
      results.tags = { error: error.message };
    }
    
    // Генерируем список если нужно
    if (generateList) {
      try {
        const listResult = await generateListHTML();
        results.list = listResult;
      } catch (error) {
        results.list = { error: error.message };
      }
    }
    
    res.json({
      message: 'Generation completed',
      results
    });
  } catch (error) {
    console.error('Error during generation:', error);
    res.status(500).json({ error: 'Failed to generate files' });
  }
});

// POST /api/generate/post/:year/:month/:slug - генерация конкретного поста
router.post('/post/:year/:month/:slug', async (req, res) => {
  try {
    const { year, month, slug } = req.params;
    
    const result = await generatePostHTML(year, month, slug);
    
    res.json({
      message: 'Post HTML generated successfully',
      result
    });
  } catch (error) {
    console.error('Error generating post HTML:', error);
    res.status(500).json({ error: 'Failed to generate post HTML' });
  }
});

// POST /api/generate/list - генерация списка постов
router.post('/list', async (req, res) => {
  try {
    const result = await generateListHTML();
    
    res.json({
      message: 'List HTML generated successfully',
      result
    });
  } catch (error) {
    console.error('Error generating list HTML:', error);
    res.status(500).json({ error: 'Failed to generate list HTML' });
  }
});

// POST /api/generate/json - обновление JSON файлов
router.post('/json', async (req, res) => {
  try {
    const results = {};
    
    // Обновляем index.json
    try {
      const indexPosts = await updateIndexJson();
      results.index = {
        posts: indexPosts.length,
        path: path.join(path.dirname(BUILD_ROOT), 'blog', 'index.json')
      };
    } catch (error) {
      results.index = { error: error.message };
    }
    
    // Обновляем tags.json
    try {
      const tags = await updateTagsJson();
      results.tags = {
        tags: Object.keys(tags).length,
        path: path.join(path.dirname(BUILD_ROOT), 'blog', 'tags.json')
      };
    } catch (error) {
      results.tags = { error: error.message };
    }
    
    res.json({
      message: 'JSON files updated successfully',
      results
    });
  } catch (error) {
    console.error('Error updating JSON files:', error);
    res.status(500).json({ error: 'Failed to update JSON files' });
  }
});

// POST /api/generate/rebuild - полная пересборка
router.post('/rebuild', async (req, res) => {
  try {
    const results = {
      posts: [],
      list: null,
      index: null,
      tags: null
    };
    
    // Очищаем build директорию
    await fs.emptyDir(BUILD_ROOT);
    
    // Обновляем JSON файлы
    try {
      const indexPosts = await updateIndexJson();
      results.index = {
        posts: indexPosts.length,
        path: path.join(path.dirname(BUILD_ROOT), 'blog', 'index.json')
      };
    } catch (error) {
      results.index = { error: error.message };
    }
    
    try {
      const tags = await updateTagsJson();
      results.tags = {
        tags: Object.keys(tags).length,
        path: path.join(path.dirname(BUILD_ROOT), 'blog', 'tags.json')
      };
    } catch (error) {
      results.tags = { error: error.message };
    }
    
    // Генерируем HTML для всех опубликованных постов
    const indexPath = path.join(path.dirname(BUILD_ROOT), 'blog', 'index.json');
    if (await fs.pathExists(indexPath)) {
      const posts = JSON.parse(await fs.readFile(indexPath, 'utf8'));
      
      for (const post of posts) {
        try {
          const [year, month, slug] = post.slug.split('/');
          const result = await generatePostHTML(year, month, slug);
          results.posts.push({
            post: post.slug,
            ...result
          });
        } catch (error) {
          results.posts.push({
            post: post.slug,
            error: error.message
          });
        }
      }
    }
    
    // Генерируем список
    try {
      const listResult = await generateListHTML();
      results.list = listResult;
    } catch (error) {
      results.list = { error: error.message };
    }
    
    res.json({
      message: 'Rebuild completed',
      results
    });
  } catch (error) {
    console.error('Error during rebuild:', error);
    res.status(500).json({ error: 'Failed to rebuild' });
  }
});

// GET /api/generate/status - статус генерации
router.get('/status', async (req, res) => {
  try {
    const indexPath = path.join(path.dirname(BUILD_ROOT), 'blog', 'index.json');
    const tagsPath = path.join(path.dirname(BUILD_ROOT), 'blog', 'tags.json');
    
    const status = {
      buildDir: await fs.pathExists(BUILD_ROOT),
      indexJson: await fs.pathExists(indexPath),
      tagsJson: await fs.pathExists(tagsPath),
      lastBuild: null
    };
    
    if (status.indexJson) {
      const stats = await fs.stat(indexPath);
      status.lastBuild = stats.mtime;
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error getting generation status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

module.exports = router;
