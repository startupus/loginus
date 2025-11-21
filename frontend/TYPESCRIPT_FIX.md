# Исправление ошибок TypeScript в IDE

Если вы видите ошибки типа "Cannot find module 'react'" или "Cannot find module 'react-router-dom'", это обычно связано с тем, что TypeScript сервер в IDE не видит зависимости из pnpm workspace.

## ✅ Быстрое решение

### Перезапуск TypeScript сервера в Cursor/VS Code

1. Нажмите `Cmd+Shift+P` (Mac) или `Ctrl+Shift+P` (Windows/Linux)
2. Введите: `TypeScript: Restart TS Server`
3. Нажмите Enter
4. Подождите 5-10 секунд

**Это должно решить проблему в 90% случаев!**

## Дополнительные решения

### 1. Проверка установки зависимостей

```bash
# В корне проекта
pnpm install

# В папке frontend
cd frontend
pnpm install
```

### 2. Перезапуск IDE

Если перезапуск TS сервера не помог, полностью перезапустите Cursor/VS Code.

### 3. Очистка кэша TypeScript

```bash
cd frontend
rm -rf node_modules/.cache
rm -rf .vite
pnpm install
```

### 4. Проверка конфигурации

Убедитесь, что в `frontend/tsconfig.json` правильно настроены опции:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "types": ["node"]
  }
}
```

## Проверка работоспособности

После исправления проверьте:

```bash
cd frontend
pnpm exec tsc --noEmit
```

Если команда выполняется без ошибок, значит TypeScript настроен правильно. Ошибки в IDE должны исчезнуть после перезапуска TS сервера.

## Если ничего не помогает

1. Закройте все файлы TypeScript
2. Закройте Cursor/VS Code
3. Удалите папку `.vscode/.typescript` (если есть)
4. Откройте проект заново
5. Перезапустите TS сервер

## Техническая информация

- Зависимости установлены через pnpm workspace
- Типы находятся в `node_modules/react-router-dom/dist/index.d.ts`
- Конфигурация TypeScript использует `moduleResolution: "bundler"` для совместимости с Vite

