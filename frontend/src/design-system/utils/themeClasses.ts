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
  // Карточка с полупрозрачным фоном (для grid элементов - адреса, документы)
  gridItem: 'bg-gray-1/50 dark:bg-dark-3/50 rounded-lg',
  // Иконка в карточке grid элемента
  gridItemIcon: 'bg-gray-1 dark:bg-dark-3 rounded-lg',
  // Hover состояние для grid элементов
  gridItemHover: 'hover:bg-gray-1 dark:hover:bg-dark-3',
};

/**
 * Классы для списков
 */
export const listClasses = {
  // Контейнер списка
  container: 'bg-background dark:bg-surface rounded-lg border border-border overflow-hidden',
  // Контейнер списка с темной границей
  containerDark: 'bg-background dark:bg-surface rounded-lg border border-border overflow-hidden',
  // Элемент списка с hover эффектом
  item: 'flex items-center justify-between py-2 group cursor-pointer hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors rounded-lg px-2 -mx-2',
  // Hover эффект для элементов списка (без layout классов)
  itemHover: 'hover:bg-gray-1 dark:hover:bg-dark-3 transition-colors',
};

/**
 * Классы для состояний
 */
export const stateClasses = {
  // Empty state
  empty: 'flex flex-col items-center justify-center p-8 bg-background dark:bg-surface rounded-lg border border-dashed border-border text-center',
  // Empty state с темной границей
  emptyDark: 'flex flex-col items-center justify-center p-8 bg-background dark:bg-surface rounded-lg border border-dashed border-border text-center',
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
  // Третичный фон (для информационных блоков)
  tertiary: 'bg-gray-1/50 dark:bg-dark-3/50',
};

/**
 * Классы для границ
 * В темной теме используются более мягкие границы для лучшего визуального восприятия
 */
export const borderClasses = {
  // Базовая граница (автоматически использует более мягкий цвет в темной теме через CSS переменную)
  default: 'border border-border',
  // Граница с темным вариантом (еще более мягкая с прозрачностью)
  // Используем border-border для обеих тем, так как CSS переменная уже настроена правильно
  dark: 'border border-border',
  // Пунктирная граница
  dashed: 'border border-dashed border-border',
  // Пунктирная граница с темным вариантом (еще более мягкая)
  dashedDark: 'border border-dashed border-border',
  // Граница сверху
  top: 'border-t border-border',
  // Граница снизу
  bottom: 'border-b border-border',
  // Граница слева
  left: 'border-l border-border',
  // Граница справа
  right: 'border-r border-border',
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
 * Классы для иконок в контейнерах (не кружках)
 */
export const iconContainerClasses = {
  // Иконка в квадратном контейнере серого цвета (стандартный для списков)
  gray: 'p-2 rounded-lg bg-gray-1 dark:bg-dark-3 flex items-center justify-center flex-shrink-0',
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
  // Декоративный круг для промо-блоков (большой, справа сверху)
  promoCircle: 'absolute rounded-full blur-3xl bg-white/5 dark:bg-white/10 top-0 right-0 w-64 h-64 -translate-y-1/2 translate-x-1/3',
  // Декоративный круг малый (малый, слева снизу)
  promoCircleSmall: 'absolute rounded-full blur-2xl bg-text-primary/5 dark:bg-text-primary/10 bottom-0 left-0 w-48 h-48 translate-y-1/3 -translate-x-1/4',
};

/**
 * Классы для промо-блоков
 */
export const promoClasses = {
  // Контейнер промо-блока с градиентом
  container: 'rounded-2xl p-8 text-white shadow-lg relative overflow-hidden',
  // Контейнер контента промо-блока
  content: 'relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6',
  // Заголовок промо-блока
  title: 'text-2xl font-bold mb-2',
  // Описание промо-блока
  description: 'text-white/80 mb-6 max-w-xl',
  // Подзаголовок промо-блока
  subtitle: 'text-white/80 text-sm',
  // Контейнер подзаголовка с иконкой
  subtitleContainer: 'flex items-center gap-2 mb-4',
  // Кнопка в промо-блоке
  button: 'border-white/20 text-white hover:bg-white/10 hover:border-white/30 dark:border-white/20 dark:text-white dark:hover:bg-white/10 dark:hover:border-white/30',
  // Иконка в промо-блоке (большая декоративная)
  icon: 'w-24 h-24 text-white/20',
};

/**
 * Классы для кнопок
 */
export const buttonClasses = {
  // Кнопка ошибки (danger)
  error: 'w-full text-error hover:text-error/80 hover:bg-error/10 border-error/30 dark:border-error/30 dark:hover:bg-error/20',
};

/**
 * Классы для контейнеров контента
 */
export const containerClasses = {
  // Контейнер контента страницы с отступами
  content: 'space-y-8 max-w-4xl mx-auto',
};

/**
 * Классы для полей ввода
 */
export const inputClasses = {
  // Базовый фон для Input и Textarea
  background: 'bg-white dark:bg-dark-3',
  // Placeholder цвет
  placeholder: 'placeholder:text-text-secondary',
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
  iconContainer: iconContainerClasses,
  decorative: decorativeClasses,
  promo: promoClasses,
  button: buttonClasses,
  container: containerClasses,
  input: inputClasses,
};

export default themeClasses;

