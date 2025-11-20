/**
 * themeClasses - стандартизированные классы темы для использования в компонентах
 * Устраняет дублирование и переопределения стилей
 * 
 * Использование:
 * import { themeClasses } from '@/design-system/utils/themeClasses';
 * 
 * <div className={themeClasses.page.container}>
 *   <div className={themeClasses.card.default}>
 *     ...
 *   </div>
 * </div>
 */

/**
 * Базовые классы для страниц
 */
export const pageClasses = {
  // Контейнер страницы с фоном
  container: 'min-h-screen bg-background dark:bg-dark',
  // Контейнер страницы с серым фоном (для дашборда)
  containerGray: 'min-h-screen bg-gray-1 dark:bg-dark',
  // Контейнер контента страницы
  content: 'bg-gray-1 dark:bg-dark p-[30px] flex-1',
  // Центрированный контент
  centered: 'flex items-center justify-center min-h-[400px]',
};

/**
 * Классы для карточек
 */
export const cardClasses = {
  // Базовая карточка
  default: 'bg-white dark:bg-dark-2 rounded-lg',
  // Карточка с тенью
  shadow: 'bg-white dark:bg-dark-2 rounded-lg shadow-lg dark:shadow-card',
  // Карточка с закругленными углами
  rounded: 'bg-white dark:bg-dark rounded-xl',
  // Карточка с закругленными углами и тенью
  roundedShadow: 'bg-white dark:bg-dark rounded-xl shadow-lg dark:shadow-card',
  // Карточка с пунктирной границей (для empty states)
  dashed: 'bg-white dark:bg-dark-2 rounded-lg border border-dashed border-border',
};

/**
 * Классы для списков
 */
export const listClasses = {
  // Контейнер списка
  container: 'bg-background dark:bg-surface rounded-lg border border-border overflow-hidden',
  // Контейнер списка с темной границей
  containerDark: 'bg-background dark:bg-surface rounded-lg border border-border dark:border-dark-3/50 overflow-hidden',
  // Элемент списка с hover эффектом
  item: 'flex items-center justify-between py-2 group cursor-pointer hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors rounded-lg px-2 -mx-2',
};

/**
 * Классы для состояний
 */
export const stateClasses = {
  // Empty state
  empty: 'flex flex-col items-center justify-center p-8 bg-background dark:bg-surface rounded-lg border border-dashed border-border text-center',
  // Empty state с темной границей
  emptyDark: 'flex flex-col items-center justify-center p-8 bg-background dark:bg-surface rounded-lg border border-dashed border-border dark:border-dark-3/50 text-center',
  // Loading state
  loading: 'flex items-center justify-center min-h-[400px]',
  // Error state
  error: 'flex items-center justify-center min-h-[400px]',
};

/**
 * Классы для текста
 */
export const textClasses = {
  // Основной текст
  primary: 'text-text-primary',
  // Вторичный текст
  secondary: 'text-text-secondary',
  // Отключенный текст
  disabled: 'text-text-disabled',
  // Белый текст
  white: 'text-white',
  // Белый текст с прозрачностью
  whiteOpacity: 'text-white/80',
};

/**
 * Классы для фонов
 */
export const backgroundClasses = {
  // Основной фон
  default: 'bg-background dark:bg-dark',
  // Серый фон
  gray: 'bg-gray-1 dark:bg-dark',
  // Серый фон 2
  gray2: 'bg-gray-2 dark:bg-dark-3',
  // Поверхность
  surface: 'bg-background dark:bg-surface',
  // Поверхность с возвышением
  surfaceElevated: 'bg-surface-elevated dark:bg-dark-2',
};

/**
 * Классы для границ
 */
export const borderClasses = {
  // Базовая граница
  default: 'border border-border',
  // Граница с темным вариантом
  dark: 'border border-border dark:border-dark-3/50',
  // Пунктирная граница
  dashed: 'border border-dashed border-border',
  // Пунктирная граница с темным вариантом
  dashedDark: 'border border-dashed border-border dark:border-dark-3/50',
};

/**
 * Классы для иконок в кружках
 */
export const iconCircleClasses = {
  // Иконка в кружке с цветом primary
  primary: 'w-12 h-12 bg-primary/10 dark:bg-primary/20 text-primary rounded-full flex items-center justify-center',
  // Иконка в кружке с цветом success
  success: 'w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center',
  // Иконка в кружке с цветом error
  error: 'w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center',
  // Иконка в кружке с цветом info
  info: 'w-12 h-12 bg-info/10 text-info rounded-full flex items-center justify-center',
  // Иконка в кружке с цветом warning
  warning: 'w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center',
  // Иконка в кружке серого цвета
  gray: 'w-12 h-12 bg-gray-1 dark:bg-dark-3 text-text-secondary rounded-full flex items-center justify-center',
};

/**
 * Классы для декоративных элементов
 */
export const decorativeClasses = {
  // Декоративный круг (blur эффект)
  circle: 'absolute rounded-full blur-3xl',
  // Декоративный круг светлый
  circleLight: 'absolute rounded-full bg-white/20 blur-3xl',
  // Декоративный круг темный
  circleDark: 'absolute rounded-full bg-white/10 blur-2xl',
};

/**
 * Объект со всеми классами темы
 */
export const themeClasses = {
  page: pageClasses,
  card: cardClasses,
  list: listClasses,
  state: stateClasses,
  text: textClasses,
  background: backgroundClasses,
  border: borderClasses,
  iconCircle: iconCircleClasses,
  decorative: decorativeClasses,
};

export default themeClasses;

