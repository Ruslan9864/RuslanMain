# Руководство по использованию шрифтов Stem

## Подключенные шрифты

Все шрифты Stem подключены в файле `fonts.css` и доступны на всех страницах сайта.

### Доступные начертания:

- **Stem-Thin** (100) - Тонкое
- **Stem-ExtraLight** (200) - Очень светлое  
- **Stem-Light** (300) - Светлое
- **Stem-Regular** (400) - Обычное (по умолчанию)
- **Stem-SemiLight** (500) - Полусветлое
- **Stem-Medium** (600) - Среднее
- **Stem-Bold** (700) - Жирное

## Использование в CSS

### Основные переменные (уже настроены в styles.css):

```css
:root {
    --font-primary: 'Stem', 'Montserrat', 'Inter', 'Modern Grotesk', sans-serif;
    --font-secondary: 'Stem', 'Roboto', 'Open Sans', sans-serif;
}
```

### Прямое использование:

```css
/* Основной текст */
body {
    font-family: 'Stem', sans-serif;
    font-weight: 400; /* Regular */
}

/* Заголовки */
h1, h2, h3 {
    font-family: 'Stem', sans-serif;
    font-weight: 700; /* Bold */
}

/* Подзаголовки */
h4, h5, h6 {
    font-family: 'Stem', sans-serif;
    font-weight: 600; /* Medium */
}
```

### Утилитарные классы (доступны в fonts.css):

```css
.font-stem { font-family: 'Stem', sans-serif; }
.font-stem-thin { font-family: 'Stem', sans-serif; font-weight: 100; }
.font-stem-extralight { font-family: 'Stem', sans-serif; font-weight: 200; }
.font-stem-light { font-family: 'Stem', sans-serif; font-weight: 300; }
.font-stem-regular { font-family: 'Stem', sans-serif; font-weight: 400; }
.font-stem-medium { font-family: 'Stem', sans-serif; font-weight: 500; }
.font-stem-semibold { font-family: 'Stem', sans-serif; font-weight: 600; }
.font-stem-bold { font-family: 'Stem', sans-serif; font-weight: 700; }
```

## Рекомендации по использованию

### Заголовки:
- **H1**: `font-weight: 700` (Bold)
- **H2**: `font-weight: 600` (Medium) 
- **H3**: `font-weight: 500` (SemiLight)

### Основной текст:
- **Параграфы**: `font-weight: 400` (Regular)
- **Акценты**: `font-weight: 600` (Medium)

### Кнопки и CTA:
- **Основные кнопки**: `font-weight: 600` (Medium)
- **Вторичные кнопки**: `font-weight: 500` (SemiLight)

## Примеры использования

```html
<!-- Заголовок -->
<h1 class="font-stem-bold">Главный заголовок</h1>

<!-- Подзаголовок -->
<h2 class="font-stem-semibold">Подзаголовок</h2>

<!-- Обычный текст -->
<p class="font-stem-regular">Основной текст страницы</p>

<!-- Акцентный текст -->
<span class="font-stem-medium">Важная информация</span>
```

## Производительность

- Все шрифты загружаются в формате WOFF2 (оптимальный размер)
- Используется `font-display: swap` для быстрого отображения
- Шрифты загружаются локально (без внешних запросов)

## Совместимость

Шрифты Stem поддерживаются всеми современными браузерами:
- Chrome 36+
- Firefox 39+
- Safari 10+
- Edge 14+

В случае отсутствия поддержки, браузер автоматически использует fallback шрифты (Montserrat, Roboto, sans-serif).
