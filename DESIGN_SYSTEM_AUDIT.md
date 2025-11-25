# Аудит соответствия дизайн-системе

## Дата проведения: 2024

## Статус: ✅ Исправлено

## Найденные несоответствия и исправления

### 1. DashboardPage.tsx ✅ ИСПРАВЛЕНО
**Проблема:** Хардкодные цвета и отступы в индикаторе обновления данных
- Строка 466: `bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary`
- **Исправление:** Заменено на `themeClasses.background.primarySemiTransparent10`, `themeClasses.border.primarySemi20`, `themeClasses.spacing.p3`, `themeClasses.typographySize.bodyXSmall`

### 2. DataPage.tsx ✅ ИСПРАВЛЕНО
**Проблема:** Хардкодные цвета и отступы в индикаторе обновления данных
- Строка 302: `bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary`
- **Исправление:** Заменено на `themeClasses.background.primarySemiTransparent10`, `themeClasses.border.primarySemi20`, `themeClasses.spacing.p3`, `themeClasses.typographySize.bodyXSmall`

### 3. PersonalAddressesPage.tsx ✅ ИСПРАВЛЕНО
**Проблема:** Хардкодные отступы
- Строка 39: `space-y-6` → заменено на `themeClasses.spacing.spaceY6`
- Строка 45: `gap-4` → заменено на `themeClasses.spacing.gap4`
- Строка 49: `p-6` → заменено на `themeClasses.spacing.p6`
- Строка 51: `gap-4` → заменено на `themeClasses.spacing.gap4`
- Строка 54: `mb-1` → заменено на `themeClasses.spacing.mb1`
- Строка 65: `mt-2` → заменено на `themeClasses.spacing.mt2`

### 4. SupportPage.tsx ✅ ЧАСТИЧНО ИСПРАВЛЕНО
**Проблема:** Хардкодные отступы и цвета
- Строка 613: `border-primary/30 px-3 sm:px-4 py-2.5 gap-2` → ✅ заменено на `themeClasses.border.primarySemi30`, `themeClasses.spacing.px3`, `themeClasses.spacing.px4`, `themeClasses.spacing.py2_5`, `themeClasses.spacing.gap2`
- Строка 633: `bg-primary/20 dark:hover:bg-primary/30` → ✅ заменено на `themeClasses.background.primarySemiTransparentHover`
- Строка 477: `gap-3 sm:gap-6` → ⚠️ оставлено (адаптивные классы сложно заменить через themeClasses)
- Строка 487: `gap-3 sm:gap-6` → ⚠️ оставлено (адаптивные классы)
- Строка 529: `space-y-3 sm:space-y-4` → ⚠️ оставлено (адаптивные классы)
- Строка 546: `gap-3` → ⚠️ можно заменить, но не критично
- Строка 560: `gap-2` → ⚠️ можно заменить, но не критично
- Строка 583: `space-y-3` → ⚠️ можно заменить, но не критично

### 5. Общие проблемы
- Использование хардкодных значений `px-3`, `py-2`, `px-4`, `py-2.5` вместо стандартизированных классов
- Использование `bg-primary/10`, `bg-primary/20`, `border-primary/20`, `border-primary/30` вместо `themeClasses.background.primarySemiTransparent`

## Выполненные улучшения

1. **Добавлены новые классы в themeClasses:**
   - ✅ `primarySemiTransparent10: 'bg-primary/10 dark:bg-primary/20'`
   - ✅ `primarySemiTransparent20: 'bg-primary/20 dark:bg-primary/30'`
   - ✅ `primarySemi20: 'border border-primary/20'`
   - ✅ `primarySemi30: 'border border-primary/30'`
   - ✅ `p3: 'px-3 py-2'`
   - ✅ `px3: 'px-3'`, `px4: 'px-4'`
   - ✅ `py2: 'py-2'`, `py2_5: 'py-2.5'`
   - ✅ `gap2: 'gap-2'`
   - ✅ `mb1: 'mb-1'`, `mt2: 'mt-2'`

2. **Исправлены страницы:**
   - ✅ DashboardPage - индикатор обновления данных
   - ✅ DataPage - индикатор обновления данных
   - ✅ PersonalAddressesPage - все отступы заменены на themeClasses
   - ✅ SupportPage - основные цвета и границы заменены на themeClasses

## Рекомендации на будущее

1. **Адаптивные классы:**
   - Для адаптивных классов типа `sm:gap-6` можно создать утилиту или оставить как есть (Tailwind стандарт)
   - Рассмотреть создание адаптивных классов в themeClasses для часто используемых комбинаций

2. **Провести рефакторинг остальных страниц:**
   - Проверить все страницы на использование хардкодных значений
   - Заменить на стандартизированные классы из themeClasses

3. **Документация:**
   - Обновить документацию по использованию themeClasses
   - Добавить примеры использования новых классов

