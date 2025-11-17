# Loginus ID - Быстрый старт 🚀

## Статус проекта

✅ **Инфраструктура готова (80%)**  
✅ **Дизайн-система создана**  
✅ **API Layer работает**  
⏳ **Страницы в разработке**

## Что уже работает

### Дизайн-система
```tsx
import { Button, Input, Badge, Avatar, Icon, Modal } from '@/design-system';

// Button - 7 вариантов, 5 размеров, loading
<Button variant="primary" size="md" loading={false}>
  Войти
</Button>

// Input - с validation, иконками
<Input 
  label="Email" 
  error="Неверный формат"
  leftIcon={<Icon name="user" />}
/>

// Badge
<Badge variant="success">Активен</Badge>

// Avatar
<Avatar initials="ДЛ" size="lg" rounded />

// Modal
<Modal isOpen={true} onClose={handleClose} title="Заголовок">
  Содержимое
</Modal>
```

### State Management (Zustand)
```tsx
import { useAuthStore, useThemeStore, useLanguageStore } from '@/store';

// Auth
const { user, login, logout, isAuthenticated } = useAuthStore();

// Theme
const { theme, setTheme } = useThemeStore();
setTheme('dark'); // 'light' | 'dark' | 'system'

// Language
const { language, setLanguage } = useLanguageStore();
setLanguage('en'); // 'ru' | 'en'
```

### API
```tsx
import { authApi, profileApi } from '@/services/api';

// Login
const response = await authApi.login('user@example.com', 'password');

// Get Profile
const profile = await profileApi.getProfile();
```

### i18n
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
t('auth.loginTitle'); // => "Вход в Loginus ID"
```

## Быстрый старт

### 1. Установка зависимостей

```bash
# Установить pnpm (если еще нет)
npm install -g pnpm

# Установить все зависимости
pnpm install
```

### 2. Запуск в режиме разработки

```bash
# Запустить frontend и backend одновременно
pnpm dev

# Или отдельно:
pnpm dev:frontend  # http://localhost:3000
pnpm dev:backend   # http://localhost:3001
```

### 3. Доступные эндпоинты Backend Mock

```
POST http://localhost:3001/api/v1/auth/login
POST http://localhost:3001/api/v1/auth/register
POST http://localhost:3001/api/v1/auth/refresh
POST http://localhost:3001/api/v1/auth/logout

GET  http://localhost:3001/api/v1/profile
PUT  http://localhost:3001/api/v1/profile
GET  http://localhost:3001/api/v1/profile/security
GET  http://localhost:3001/api/v1/profile/sessions

GET  http://localhost:3001/api/v1/admin/stats
GET  http://localhost:3001/api/v1/admin/users
GET  http://localhost:3001/api/v1/admin/audit-logs

GET  http://localhost:3001/api/v1/health
```

### 4. Тестовые данные

**Пользователь 1 (Админ):**
```json
{
  "email": "lukyan.dmitriy@ya.ru",
  "phone": "+79091503444",
  "password": "password123"
}
```

**Пользователь 2:**
```json
{
  "email": "ivan@example.com",
  "phone": "+79001234567",
  "password": "password123"
}
```

## Структура проекта

```
loginus-ui/
├── frontend/                     # React приложение
│   ├── src/
│   │   ├── design-system/        # 🎨 Дизайн-система
│   │   │   ├── primitives/       # Button, Input, Badge, Avatar, Icon
│   │   │   ├── composites/       # Modal, Form, Table
│   │   │   └── themes/           # Токены (colors, typography)
│   │   ├── store/                # 💾 Zustand stores
│   │   ├── services/             # 🔌 API + i18n
│   │   ├── pages/                # 📄 Страницы (в разработке)
│   │   └── components/           # 🧩 Бизнес-компоненты
│   └── package.json
│
└── backend-mock/                 # NestJS мок API
    ├── src/
    │   ├── auth/                 # ✅ Auth endpoints
    │   ├── profile/              # ✅ Profile endpoints
    │   └── admin/                # ✅ Admin endpoints
    ├── data/                     # 📦 Мок-данные (JSON)
    └── package.json
```

## Следующие шаги

1. **Создать страницы:**
   - `frontend/src/pages/auth/LoginPage.tsx`
   - `frontend/src/pages/DashboardPage.tsx`
   - `frontend/src/pages/profile/ProfilePage.tsx`

2. **Настроить роутинг:**
   - React Router v6
   - Защищенные маршруты

3. **Добавить React Query:**
   - Провайдер в `main.tsx`
   - Хуки для кэширования

4. **Layouts компоненты:**
   - Header, Footer, Sidebar

## Полезные команды

```bash
# Development
pnpm dev                    # Запуск всего
pnpm dev:frontend           # Только frontend
pnpm dev:backend            # Только backend

# Build
pnpm build                  # Сборка frontend
pnpm build:all              # Сборка всего

# Linting
pnpm lint                   # Проверка кода
pnpm format                 # Форматирование

# Cleanup
pnpm clean                  # Очистка
```

## Документация

- [README.md](./README.md) - Полная техническая документация
- [INFO.md](./INFO.md) - Бизнес-описание проекта
- [TODO.md](./TODO.md) - Рабочий чеклист
- [PROGRESS.md](./PROGRESS.md) - Статус выполнения

## Технологии

- ⚛️ React 18
- ⚡ Vite
- 📘 TypeScript (strict mode)
- 🎨 TailwindCSS
- 🐻 Zustand
- 🌍 i18next
- 📡 Axios
- 🐦 NestJS

---

**Проект готов к разработке! 🎉**

*Создано: 2025-01-16*

