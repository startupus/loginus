# Исправление фонов в темной теме - Сводка изменений

## Проблема

Обнаружено несоответствие фонов компонентов в темной теме:
- **Неправильно**: `dark:bg-gray-2` и `dark:bg-transparent` использовались в некоторых компонентах
- **Правильно**: `dark:bg-dark-3` должен использоваться для карточек grid элементов и полей ввода

## Реализованные исправления

### 1. Добавлены стандартизированные классы в `themeClasses`

**Файл:** `frontend/src/design-system/utils/themeClasses.ts`

Добавлены новые классы:
- `card.gridItem` - для карточек с полупрозрачным фоном (`bg-gray-1/50 dark:bg-dark-3/50`)
- `card.gridItemIcon` - для иконок в карточках (`bg-gray-1 dark:bg-dark-3`)
- `card.gridItemHover` - для hover состояний (`hover:bg-gray-1 dark:hover:bg-dark-3`)
- `input.background` - для полей ввода (`bg-white dark:bg-dark-3`)
- `input.placeholder` - для placeholder текста

### 2. Исправлены компоненты Input и Textarea

**Файлы:**
- `frontend/src/design-system/primitives/Input/Input.tsx`
- `frontend/src/design-system/primitives/Textarea/Textarea.tsx`

**Изменение:** Заменен `dark:bg-transparent` на `dark:bg-dark-3` через `themeClasses.input.background`

### 3. Исправлены grid компоненты

**Файлы:**
- `frontend/src/components/Dashboard/AddressesGrid.tsx`
- `frontend/src/components/Dashboard/WorkGroups.tsx`
- `frontend/src/components/Dashboard/FamilyMembers.tsx`

**Изменение:** Заменены прямые классы на стандартизированные из `themeClasses.card`

### 4. Добавлены глобальные CSS правила

**Файл:** `frontend/src/index.css`

Добавлены правила для автоматического переопределения неправильных классов:
- **Правило 6**: Переопределяет `dark:bg-gray-2/50` на `dark:bg-dark-3/50` для grid карточек
- **Правило 7**: Переопределяет `dark:bg-gray-2` на `dark:bg-dark-3` для иконок
- **Правило 8**: Переопределяет `dark:bg-transparent` на `dark:bg-dark-3` для Input/Textarea
- **Правило 9**: Исправляет hover состояния для grid элементов

## Стандарт использования

### Для grid карточек (адреса, документы, члены семьи):
```tsx
// ✅ Правильно
className={`${themeClasses.card.gridItem} ${themeClasses.border.default}`}

// ❌ Неправильно
className="bg-gray-1/50 dark:bg-gray-2/50"
```

### Для иконок в grid карточках:
```tsx
// ✅ Правильно
className={themeClasses.card.gridItemIcon}

// ❌ Неправильно
className="bg-gray-1 dark:bg-gray-2"
```

### Для полей ввода:
```tsx
// ✅ Правильно
className={themeClasses.input.background}

// ❌ Неправильно
className="bg-white dark:bg-transparent"
```

## Результат

Теперь все компоненты используют единый стандарт фонов в темной теме:
- Grid карточки: `dark:bg-dark-3/50` (полупрозрачный)
- Иконки в карточках: `dark:bg-dark-3` (непрозрачный)
- Поля ввода: `dark:bg-dark-3` (непрозрачный)

Глобальные CSS правила гарантируют, что даже если где-то остались старые классы, они будут автоматически исправлены.

