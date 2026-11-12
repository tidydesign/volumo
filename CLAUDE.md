# Проект: Volumo

Площадка для прототипов и экспериментов. Пока быстрые прототипы, в перспективе — связка с дизайн-системой (Figma Variables → токены, Code Connect).

## Стек
- Vite + vanilla JS, без фреймворков
- Анимации: GSAP (+ ScrollTrigger), плавный скролл: Lenis
- Стили: чистый CSS, без Tailwind и препроцессоров
- Деплой: GitHub (tidydesign/volumo) → Vercel, автодеплой при push в main

## Структура
- index.html + src/hub.js — главная: список всех прототипов (собирается автоматически)
- prototypes/<name>/ — один прототип = одна папка со своими index.html, main.js, style.css. Открывается по /prototypes/<name>/
- prototypes/_template/ — шаблон нового прототипа. Папки с "_" в начале не попадают ни в сборку, ни в список
- src/main.js — общий код: initSmoothScroll(), реэкспорт gsap и ScrollTrigger
- src/motion.js — все тайминги и easing
- src/styles/ — tokens.css (переменные), base.css, hub.css
- vite.config.js — сам находит prototypes/*/index.html, руками ничего добавлять не нужно

## Новый прототип
1. Скопировать prototypes/_template в prototypes/<name> (kebab-case, на английском)
2. Поправить <title> и разметку
3. Общие токены — из src/styles/tokens.css, свои стили — в style.css прототипа

## Дизайн-токены
- Цвета, шрифты и отступы берём из Figma Variables и кладём в CSS custom properties в tokens.css
- Сейчас в tokens.css заглушки, заменить на значения из Figma, когда появится дизайн-система
- В стилях использовать только переменные, никаких захардкоженных значений

## Responsive
- Mobile-first, media queries через min-width
- Диапазоны устройств: Mobile <640px, Tablet 640–1199px, Laptop 1200–1599px, Desktop ≥1600px
- Брейкпоинты (min-width): 640px, 1200px, 1600px
- Фреймы Figma (360 / 768 / 1440 / 1920) — визуализация типичного экрана внутри диапазона, а не границы
- Fluid-размеры (clamp) там, где дизайн это допускает

## Разметка
- Семантический HTML (header, main, section, nav, footer)
- Классы по BEM, названия на английском

## Анимации
- Анимировать только transform и opacity
- Easing по умолчанию: cubic-bezier(.16, 1, .3, 1), длительность 400–700 мс
- Обязательно учитывать prefers-reduced-motion
- Все тайминги и easing — в src/motion.js (и зеркально в tokens.css для CSS-переходов)

## Порядок работы
- Это прототипы: скорость важнее полировки, но правила выше соблюдаем
- После каждого завершённого прототипа предлагай git commit с понятным сообщением
- Не ставь новые зависимости без моего согласия
- Если задача или макет неоднозначны, спроси, а не угадывай
