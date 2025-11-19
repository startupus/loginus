/**
 * Loginus Design System - Single Source of Truth
 * Централизованный экспорт всех компонентов дизайн-системы
 * 
 * Структура по Atomic Design:
 * - Primitives (Atoms): базовые неделимые компоненты
 * - Composites (Molecules): композиция примитивов
 * - Layouts (Organisms): макеты страниц
 * - Contexts: React контексты для theme, language, etc.
 * - Utils: утилиты для работы с темами, responsive, etc.
 */

// Primitives (Atoms)
export * from './primitives';

// Composites (Molecules)
export * from './composites';

// Layouts (Organisms)
export * from './layouts';

// Contexts (Theme, Language, Permissions, etc.)
export * from './contexts';

// Utils (Theme utilities, Responsive utilities, etc.)
export * from './utils';

// Themes (Token definitions)
export * from './themes/tokens';

// Hooks
export * from './hooks';

// Utils - responsive
export * from './utils/responsiveUtils';

// Themes - client themes
export { generateClientTheme, presetClientThemes } from './themes/clientTheme';
export type { ClientThemeConfig } from './themes/clientTheme';


