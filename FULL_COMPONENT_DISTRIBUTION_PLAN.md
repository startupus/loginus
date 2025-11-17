# План создания страниц на базе TailGrids

## Текущая ситуация

**Что есть:**
- ✅ Банк TailGrids (623 компонента) в `design-system/tailgrids-bank/`
- ✅ Дизайн-система: Button, Input, Badge, Modal, WidgetCard (адаптированы из TailGrids)
- ✅ Layouts: Header, Footer, Sidebar, PageTemplate (кастомные)
- ✅ Темная тема работает визуально

**Что удалено:**
- ❌ ВСЕ страницы (pages/ пусто)
- ❌ ВСЕ компоненты страниц (components/ только ErrorBoundary)

**Проблема:** Сайт не работает, нет ни одной страницы

---

## Подход (ПРАВИЛЬНЫЙ)

1. **Создаем страницы** одну за другой
2. **Используем компоненты из банка** как есть (JSX)
3. **Адаптируем только когда понадобится** (для интеграции с TypeScript, ThemeContext, i18n)
4. **НЕ меняем структуру** дизайн-системы (primitives/composites/layouts)

---

## План создания страниц

### ФАЗА 1: Создать простые страницы (1-2 часа)

#### 1.1 LoginPage - страница входа

**Источник:** `tailgrids-bank/ApplicationComponents/Signin/Signin1.jsx`

**Процесс:**
1. Создать `pages/auth/LoginPage.tsx`
2. Взять форму из Signin1.jsx
3. Использовать наши адаптированные Button и Input
4. Добавить i18n для текстов
5. Подключить к роутеру

**Компоненты:**
- ✅ Button (уже адаптирован)
- ✅ Input (уже адаптирован)
- Никаких новых не нужно

---

#### 1.2 RegisterPage - регистрация

**Источник:** `tailgrids-bank/ApplicationComponents/Signin/Signin2.jsx` или Signin3.jsx

**Процесс:**
Аналогично LoginPage

---

#### 1.3 Error pages - страницы ошибок

**Источник:** `tailgrids-bank/ApplicationComponents/Error/`
- Error1.jsx → 404 NotFoundPage
- Error2.jsx → 403 ForbiddenPage
- Error3.jsx → 500 ServerErrorPage
- Error4.jsx → 503 ServiceUnavailablePage
- Error5.jsx → 401 UnauthorizedPage

**Процесс:**
1. Создать `pages/errors/NotFoundPage.tsx`
2. Взять разметку из Error1.jsx
3. Использовать наш Button
4. Добавить i18n
5. НЕ создавать новых компонентов

---

### ФАЗА 2: Создать DashboardPage (2-3 часа)

#### 2.1 Изучить варианты из банка

**Варианты Dashboard:**
- `tailgrids-bank/DashboardComponents/DataStats/` - 10 вариантов статистики
- `tailgrids-bank/DashboardComponents/Chart/` - 10 вариантов графиков
- `tailgrids-bank/DashboardComponents/Profile/` - 5 вариантов профиля

**Выбрать:**
- DataStats1.jsx - для виджета статистики
- Profile1.jsx или Profile2.jsx - для виджета профиля

---

#### 2.2 Создать DashboardPage

**Файл:** `pages/DashboardPage.tsx`

**Процесс:**
1. Использовать PageTemplate (уже есть)
2. Взять разметку карточек из DataStats1.jsx
3. Использовать наш WidgetCard
4. НЕ создавать отдельные компоненты виджетов
5. Всё в одном файле DashboardPage.tsx

**Компоненты:**
- ✅ PageTemplate (уже есть)
- ✅ WidgetCard (уже адаптирован)
- ✅ Button (уже адаптирован)
- Никаких новых не создаем

---

### ФАЗА 3: Создать остальные страницы (3-4 часа)

#### 3.1 PersonalDataPage

**Файл:** `pages/personal/PersonalDataPage.tsx`

**Компоненты:**
- Использовать наш DataSection (уже есть)
- Использовать Card из банка для карточек документов
- Если нужен специфичный компонент - адаптировать из банка

---

#### 3.2 FamilyPage

**Файл:** `pages/family/FamilyPage.tsx`

**Компоненты:**
- Avatar (уже адаптирован)
- Badge (уже адаптирован)  
- Card для карточек членов семьи

---

#### 3.3 PayPage

**Файл:** `pages/pay/PayPage.tsx`

**Компоненты:**
- Card для карточек платежей
- Button для действий

---

#### 3.4 SupportPage

**Файл:** `pages/support/SupportPage.tsx`

**Компоненты:**
- Card для FAQ
- Input и Button для формы

---

#### 3.5 SecurityPage

**Файл:** `pages/profile/SecurityPage.tsx`

**Компоненты:**
- DataSection
- Card
- Button

---

#### 3.6 AboutPage

**Источник:** `tailgrids-bank/MarketingComponents/About/`

**Выбрать:** About1.jsx или About2.jsx

**Процесс:**
Взять готовую разметку из банка, адаптировать под TypeScript

---

## Правила адаптации

### Когда НЕ адаптировать:
- Если можно использовать компонент прямо в JSX на странице

### Когда адаптировать:
- Если компонент используется на НЕСКОЛЬКИХ страницах
- Если нужна интеграция с TypeScript типами
- Если нужна интеграция с ThemeContext
- Если нужна интеграция с i18n

### Куда адаптировать:
- Atom (кнопка, поле) → `primitives/`
- Molecule (форма, карточка, таблица) → `composites/`
- Organism (навбар, футер) → `layouts/`

---

## Приоритеты

### Критично (сделать сначала):
1. LoginPage - чтобы можно было войти
2. Error pages - базовая навигация
3. DashboardPage - главная страница

### Высокий:
4. RegisterPage
5. ProfilePage
6. SecurityPage

### Средний:
7. PersonalDataPage
8. FamilyPage
9. PayPage
10. SupportPage
11. AboutPage

---

## Оценка времени

- LoginPage + RegisterPage: 30 минут
- Error pages (5 шт): 30 минут
- DashboardPage: 1 час
- PersonalDataPage: 1 час
- FamilyPage: 30 минут
- PayPage: 30 минут
- SupportPage: 30 минут
- SecurityPage: 30 минут
- ProfilePage: 30 минут
- AboutPage: 30 минут

**Итого:** ~6 часов

---

**Начать с LoginPage?**
