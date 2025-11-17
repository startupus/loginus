# TODO - Рабочий чеклист Loginus ID

> **Правило:** Все выполненные задачи (✅) немедленно переносятся в архив в конце файла.

## Текущие задачи

### Инфраструктура

- [x] Инициализация монорепозитория с PNPM workspaces
- [x] Setup Frontend: Vite + React + TypeScript + TailwindCSS
- [x] Setup Backend Mock: NestJS + TypeScript + CORS
- [x] Создание документации: README.md, INFO.md, TODO.md
- [ ] Настройка CI/CD (GitHub Actions)

### Дизайн-система

- [ ] Создание токенов дизайн-системы (colors, typography, spacing)
- [ ] Реализация Primitives компонентов (Button, Input, Badge, Avatar, Icon)
- [ ] Реализация Composites компонентов (Form, Modal, Table, Dropdown, Tabs)
- [ ] Реализация Layouts (Header, Footer, Sidebar, PageTemplate)
- [ ] Storybook для компонентов

### i18n и локализация

- [ ] Настройка i18next
- [ ] Создание переводов ru.json
- [ ] Создание переводов en.json
- [ ] Интеграция переводов в компоненты

### API Layer

- [ ] Создание Axios client с interceptors
- [ ] Setup React Query
- [ ] API методы для Auth
- [ ] API методы для Profile
- [ ] API методы для Admin
- [ ] Обработка ошибок API

### State Management

- [ ] Создание Zustand store для темы
- [ ] Создание Zustand store для языка
- [ ] Создание Zustand store для auth
- [ ] Интеграция с React Query

### Backend Mock

- [x] Реализация Auth endpoints
- [x] Реализация Profile endpoints
- [x] Реализация Admin endpoints
- [ ] Создание мультиязычных мок-данных (users.json, translations, sessions)
- [ ] Middleware для JWT токенов

### Страницы - Авторизация

- [ ] Login Page - форма входа
- [ ] Login Page - альтернативные способы (QR, SMS)
- [ ] Register Page - регистрация по телефону
- [ ] Forgot Password Page
- [ ] Reset Password Page
- [ ] About Page

### Страницы - Профиль

- [ ] Dashboard (главная страница после входа)
- [ ] Personal Data Overview
- [ ] Profile Edit (ФИО, дата рождения, пол, аватар)
- [ ] Public Profile
- [ ] Documents - список всех документов
- [ ] Add Document Pages (паспорт, загран, ВУ, СТС, ОМС, ДМС, ИНН, СНИЛС)
- [ ] Vehicles - список автомобилей
- [ ] Add Vehicle Page
- [ ] Addresses - список адресов
- [ ] Add Address Pages (home, work, other)
- [ ] Phones Management
- [ ] Emails Management
- [ ] External Accounts (OAuth)
- [ ] Data Access Management
- [ ] Communication Preferences
- [ ] Service Data
- [ ] Accessibility Settings
- [ ] Delete Profile

### Страницы - Безопасность

- [ ] Security Overview
- [ ] Login Methods - способы входа
- [ ] Change Password
- [ ] Recovery Methods
- [ ] Biometric Login Setup
- [ ] Security Key Setup
- [ ] Activity Log (180 дней)
- [ ] Devices Management
- [ ] App Passwords
- [ ] Two-Factor Auth Setup

### Страницы - Семья

- [ ] Family Group
- [ ] Invite Member
- [ ] Create Child Account
- [ ] Family Roles
- [ ] Family Payment
- [ ] Pets Management

### Страницы - Платежи

- [ ] Payment Overview
- [ ] Cards Management
- [ ] Payment History
- [ ] Subscriptions

### Страницы - Приложения и API

- [ ] Connected Apps
- [ ] App Details
- [ ] Revoke Access
- [ ] Developer Dashboard
- [ ] API Keys Management
- [ ] Create API Key
- [ ] OAuth Apps Management
- [ ] Create OAuth App
- [ ] API Documentation

### Страницы - Админ-панель

- [ ] Admin Dashboard
- [ ] Analytics Page
- [ ] Users List
- [ ] User Details
- [ ] Block User
- [ ] User Activity
- [ ] System Settings
- [ ] Theme Customization
- [ ] Branding Settings
- [ ] Localization Management
- [ ] Security Policies
- [ ] Rate Limiting Settings
- [ ] IP Rules
- [ ] Audit Logs
- [ ] System Logs
- [ ] Failed Logins
- [ ] OAuth Providers Management
- [ ] Email Settings (SMTP)
- [ ] SMS Settings

### Страницы - Поддержка

- [ ] Help Center
- [ ] Contact Support
- [ ] FAQ

### Страницы - Настройки

- [ ] General Settings
- [ ] Language Settings
- [ ] Timezone Settings
- [ ] Notifications Settings

### Тестирование

- [ ] E2E тесты - Auth flow
- [ ] E2E тесты - Profile flow
- [ ] E2E тесты - Admin flow
- [ ] Unit тесты для утилит
- [ ] Создание TESTING.md

### Безопасность и оптимизация

- [ ] CSP (Content Security Policy)
- [ ] Rate limiting
- [ ] XSS защита
- [ ] CSRF защита
- [ ] Lazy loading компонентов
- [ ] Code splitting по роутам
- [ ] Bundle optimization

---

## Архив выполненных задач

### ✅ Завершено 2025-01-16

**Инфраструктура:**
- ✅ Инициализация монорепозитория с PNPM workspaces (root package.json, pnpm-workspace.yaml)
- ✅ Создание .gitignore и .prettierrc
- ✅ Setup Frontend: Vite + React + TypeScript + TailwindCSS + TailGrids
  - Настроен Vite с React
  - Настроен TypeScript (tsconfig.json, tsconfig.node.json)
  - Настроен TailwindCSS с кастомными токенами (colors, spacing, shadows)
  - Настроен ESLint и Prettier
  - Создан index.html, main.tsx, App.tsx
  - Настроены path aliases (@components, @pages, и т.д.)
  - Создана структура папок src/
- ✅ Setup Backend Mock: NestJS + TypeScript + CORS configuration
  - Настроен NestJS проект
  - Настроен TypeScript
  - Настроен ESLint и Prettier для NestJS
  - Настроен CORS для http://localhost:3000
  - Создан main.ts с bootstrap
  - Создана структура модулей (app, auth, profile, admin)
- ✅ Реализация Auth endpoints в NestJS моке
  - POST /api/v1/auth/login
  - POST /api/v1/auth/register
  - POST /api/v1/auth/refresh
  - POST /api/v1/auth/logout
- ✅ Реализация Profile endpoints в NestJS моке
  - GET /api/v1/profile
  - PUT /api/v1/profile
  - GET /api/v1/profile/security
  - GET /api/v1/profile/sessions
- ✅ Реализация Admin endpoints в NestJS моке
  - GET /api/v1/admin/stats
  - GET /api/v1/admin/users
  - GET /api/v1/admin/audit-logs
- ✅ Создание документации: README.md, INFO.md, TODO.md

---

*Последнее обновление: 2025-01-16*

