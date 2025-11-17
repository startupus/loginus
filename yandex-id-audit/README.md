# Аудит Яндекс ID и ТЗ для Loginus

## Описание

Этот раздел содержит результаты визуального аудита страниц https://id.yandex.ru/ и технические задания на модернизацию/реализацию аналогичных страниц в системе Loginus.

## Структура

```
yandex-id-audit/
├── pages/              # ТЗ по страницам
│   ├── 01-main-dashboard.md
│   ├── 02-personal-data.md
│   ├── 03-pay.md
│   ├── 04-family.md
│   ├── 05-security.md
│   └── 06-support.md
├── modals/             # ТЗ по попапам и модальным окнам
│   └── profile-popup.md
├── modernization-plan.md  # Сводный план модернизации
└── README.md           # Этот файл
```

## Список ТЗ

### Страницы

1. **[Главная страница (Dashboard)](./pages/01-main-dashboard.md)**
   - URL: https://id.yandex.ru/
   - Статус: Подробное ТЗ готово
   - Приоритет: Высокий

2. **[Персональные данные](./pages/02-personal-data.md)**
   - URL: https://id.yandex.ru/personal
   - Статус: Подробное ТЗ готово
   - Приоритет: Высокий

3. **[Платежи (Пэй)](./pages/03-pay.md)**
   - URL: https://id.yandex.ru/pay
   - Статус: Краткое ТЗ готово
   - Приоритет: Средний

4. **[Семья](./pages/04-family.md)**
   - URL: https://id.yandex.ru/family
   - Статус: Краткое ТЗ готово
   - Приоритет: Средний

5. **[Безопасность](./pages/05-security.md)**
   - URL: https://id.yandex.ru/security
   - Статус: Краткое ТЗ готово
   - Приоритет: Критично

6. **[Поддержка](./pages/06-support.md)**
   - URL: https://id.yandex.ru/helpdesk
   - Статус: Краткое ТЗ готово
   - Приоритет: Низкий

### Попапы и модальные окна

1. **[Попап профиля](./modals/profile-popup.md)**
   - Триггер: Кнопка "Ваш профиль" в header
   - Статус: ТЗ готово

## План модернизации

См. [modernization-plan.md](./modernization-plan.md) для:
- Матрицы соответствия страниц
- Приоритетов модернизации
- Оценки сложности
- Зависимостей между страницами

## Методология

### Анализ лучших практик

Для каждой страницы проанализированы:
- Информационная архитектура
- Визуальная иерархия
- Интерактивность
- UX паттерны
- Адаптивность
- Accessibility

### Стандарты Loginus

Все ТЗ учитывают:
- Atomic Design (Primitives → Composites → Layouts → Pages)
- Theme-driven Design (light.ts, dark.ts, ThemeContext)
- TailGrids компоненты из корп репозитория
- i18n (react-i18next)
- TypeScript строгая типизация
- React Query для API
- Zustand для state

## Использование

1. Откройте нужное ТЗ в папке `pages/`
2. Изучите структуру страницы и примеры кода
3. Реализуйте согласно плану модернизации
4. Следуйте стандартам Loginus

## Скриншоты

Скриншоты страниц сохранены в `.playwright-mcp/`:
- `yandex-id-main-dashboard.png`
- `yandex-id-personal-data.png`

---

**Дата создания:** 2025-01-17  
**Статус:** Аудит завершен, ТЗ готовы

