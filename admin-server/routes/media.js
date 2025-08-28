const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/media/upload - загрузка изображения
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type = 'media' } = req.body; // 'cover' или 'media'
    const originalPath = req.file.path;
    const filename = req.file.filename;
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);

    // Создаем директории для разных типов
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const typeDir = path.join(uploadsDir, type);
    await fs.ensureDir(typeDir);

    // Перемещаем файл в нужную директорию
    const newPath = path.join(typeDir, filename);
    await fs.move(originalPath, newPath);

    // Конвертируем в WebP и создаем разные размеры
    const webpFilename = `${nameWithoutExt}.webp`;
    const webpPath = path.join(typeDir, webpFilename);

    // Основное изображение (максимум 1600px)
    await sharp(newPath)
      .resize(1600, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(webpPath);

    // Создаем превью (480px)
    const previewFilename = `${nameWithoutExt}-preview.webp`;
    const previewPath = path.join(typeDir, previewFilename);
    
    await sharp(newPath)
      .resize(480, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(previewPath);

    // Создаем среднее изображение (960px)
    const mediumFilename = `${nameWithoutExt}-medium.webp`;
    const mediumPath = path.join(typeDir, mediumFilename);
    
    await sharp(newPath)
      .resize(960, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(mediumPath);

    // Получаем метаданные
    const metadata = await sharp(newPath).metadata();

    // Удаляем оригинальный файл если это не SVG
    if (ext.toLowerCase() !== '.svg') {
      await fs.remove(newPath);
    }

    res.json({
      message: 'File uploaded successfully',
      files: {
        original: filename,
        webp: webpFilename,
        preview: previewFilename,
        medium: mediumFilename
      },
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      },
      urls: {
        original: `/uploads/${type}/${filename}`,
        webp: `/uploads/${type}/${webpFilename}`,
        preview: `/uploads/${type}/${previewFilename}`,
        medium: `/uploads/${type}/${mediumFilename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// POST /api/media/upload-multiple - загрузка нескольких изображений
router.post('/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { type = 'media' } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        const originalPath = file.path;
        const filename = file.filename;
        const ext = path.extname(filename);
        const nameWithoutExt = path.basename(filename, ext);

        // Создаем директории
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        const typeDir = path.join(uploadsDir, type);
        await fs.ensureDir(typeDir);

        // Перемещаем файл
        const newPath = path.join(typeDir, filename);
        await fs.move(originalPath, newPath);

        // Конвертируем в WebP
        const webpFilename = `${nameWithoutExt}.webp`;
        const webpPath = path.join(typeDir, webpFilename);

        await sharp(newPath)
          .resize(1600, null, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(webpPath);

        // Создаем превью
        const previewFilename = `${nameWithoutExt}-preview.webp`;
        const previewPath = path.join(typeDir, previewFilename);
        
        await sharp(newPath)
          .resize(480, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(previewPath);

        // Получаем метаданные
        const metadata = await sharp(newPath).metadata();

        // Удаляем оригинал если не SVG
        if (ext.toLowerCase() !== '.svg') {
          await fs.remove(newPath);
        }

        results.push({
          originalName: file.originalname,
          files: {
            original: filename,
            webp: webpFilename,
            preview: previewFilename
          },
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
          },
          urls: {
            original: `/uploads/${type}/${filename}`,
            webp: `/uploads/${type}/${webpFilename}`,
            preview: `/uploads/${type}/${previewFilename}`
          }
        });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: 'Failed to process file'
        });
      }
    }

    res.json({
      message: 'Files uploaded successfully',
      results
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// GET /api/media/list - список загруженных файлов
router.get('/list', async (req, res) => {
  try {
    const { type = 'media' } = req.query;
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', type);
    
    if (!await fs.pathExists(uploadsDir)) {
      return res.json([]);
    }

    const files = await fs.readdir(uploadsDir);
    const fileList = [];

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        fileList.push({
          name: file,
          size: stats.size,
          modified: stats.mtime,
          url: `/uploads/${type}/${file}`
        });
      }
    }

    // Сортируем по дате изменения (новые сначала)
    fileList.sort((a, b) => b.modified - a.modified);

    res.json(fileList);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// DELETE /api/media/:filename - удаление файла
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'media' } = req.query;
    
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', type);
    const filePath = path.join(uploadsDir, filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Удаляем файл и связанные с ним версии
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);

    const filesToDelete = [
      filePath,
      path.join(uploadsDir, `${nameWithoutExt}.webp`),
      path.join(uploadsDir, `${nameWithoutExt}-preview.webp`),
      path.join(uploadsDir, `${nameWithoutExt}-medium.webp`)
    ];

    for (const file of filesToDelete) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// POST /api/media/optimize - оптимизация существующих изображений
router.post('/optimize', async (req, res) => {
  try {
    const { type = 'media' } = req.body;
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', type);
    
    if (!await fs.pathExists(uploadsDir)) {
      return res.json({ message: 'No files to optimize' });
    }

    const files = await fs.readdir(uploadsDir);
    const results = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        try {
          const filePath = path.join(uploadsDir, file);
          const nameWithoutExt = path.basename(file, ext);
          const webpPath = path.join(uploadsDir, `${nameWithoutExt}.webp`);

          // Конвертируем в WebP
          await sharp(filePath)
            .resize(1600, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(webpPath);

          // Создаем превью
          const previewPath = path.join(uploadsDir, `${nameWithoutExt}-preview.webp`);
          await sharp(filePath)
            .resize(480, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(previewPath);

          results.push({
            file,
            status: 'optimized',
            webp: `${nameWithoutExt}.webp`,
            preview: `${nameWithoutExt}-preview.webp`
          });
        } catch (error) {
          results.push({
            file,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    res.json({
      message: 'Optimization completed',
      results
    });
  } catch (error) {
    console.error('Error optimizing files:', error);
    res.status(500).json({ error: 'Failed to optimize files' });
  }
});

module.exports = router;
