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
  // Loading spinner контейнер
  loadingSpinner: 'text-center',
  // Loading spinner элемент
  loadingSpinnerElement: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4',
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
  // Текст ошибки
  error: 'text-error',
  // Hover состояния
  hoverPrimary: 'hover:text-text-primary',
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
  // Иконка в контейнере с активным состоянием (success)
  active: 'p-2 rounded-lg bg-success/10 text-success',
  // Иконка в контейнере с неактивным состоянием
  inactive: 'p-2 rounded-lg bg-gray-2 dark:bg-dark-3 text-text-secondary',
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
  // Контейнер промо-блока с градиентом warning (для семейной группы)
  containerWarning: 'rounded-2xl p-8 text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-warning to-warning/80 dark:from-warning/90 dark:to-warning/70',
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
  // Кнопка в промо-блоке с инвертированными цветами (темный текст на светлом фоне)
  buttonInverted: 'bg-text-primary text-background hover:bg-text-primary/90 dark:bg-text-primary dark:text-dark dark:hover:bg-text-primary/90 border-none',
  // Иконка в промо-блоке (большая декоративная)
  icon: 'w-24 h-24 text-white/20',
  // Иконка в промо-блоке (скрыта на мобильных)
  iconHidden: 'hidden md:block',
};

/**
 * Классы для кнопок
 */
export const buttonClasses = {
  // Кнопка ошибки (danger)
  error: 'w-full text-error hover:text-error/80 hover:bg-error/10 border-error/30 dark:border-error/30 dark:hover:bg-error/20',
  // Кнопка удаления (ghost вариант с ошибкой)
  delete: 'w-full justify-start text-error hover:bg-error/10 dark:hover:bg-error/20 transition-colors gap-3',
  // Иконка в кнопке удаления
  deleteIcon: 'p-1.5 bg-error/10 text-error rounded-full flex items-center justify-center shrink-0',
};

/**
 * Классы для контейнеров контента
 */
export const containerClasses = {
  // Контейнер контента страницы с отступами
  content: 'space-y-8 max-w-4xl mx-auto',
  // Стандартный контейнер страницы
  standard: 'container mx-auto px-4',
  // Контейнер с максимальной шириной
  maxWidth: 'max-w-7xl mx-auto',
};

/**
 * Классы для layout страниц
 */
export const layoutClasses = {
  // Основной контент страницы (main)
  mainContent: 'container mx-auto px-4 pt-24 pb-20 lg:pt-28',
  // Flex контейнер с колонками
  flexRow: 'flex flex-col lg:flex-row gap-8',
  // Flex контейнер с оберткой
  flexWrap: 'flex flex-wrap gap-4',
  // Центрированный контент
  centered: 'flex items-center justify-center',
  // Пространство между элементами
  spaceBetween: 'flex flex-col items-center justify-between gap-6 md:flex-row',
  // Выравнивание текста
  textCenter: 'text-center',
  textRight: 'text-right',
  textLeft: 'text-left',
  // Центрирование по горизонтали
  mxAuto: 'mx-auto',
};

/**
 * Классы для typography (prose)
 */
export const typographyClasses = {
  // Prose контейнер для статей
  prose: 'prose prose-lg max-w-none dark:prose-invert',
};

/**
 * Классы для таблиц
 */
export const tableClasses = {
  // Базовая таблица
  base: 'w-full border-collapse',
  // Строка таблицы
  row: 'py-6 align-top',
  // Ячейка таблицы
  cell: 'py-6 pr-8 align-top w-16',
};

/**
 * Классы для активных состояний (sidebar, navigation)
 */
export const activeClasses = {
  // Активный элемент навигации
  navItem: 'font-medium bg-primary/10 dark:bg-primary/20',
  // Неактивный элемент навигации
  navItemInactive: 'hover:bg-gray-1 dark:hover:bg-dark-3',
};

/**
 * Классы для spacing (отступы)
 */
export const spacingClasses = {
  // Margin bottom
  mb3: 'mb-3',
  mb4: 'mb-4',
  mb6: 'mb-6',
  mb8: 'mb-8',
  mb12: 'mb-12',
  // Margin top
  mt1: 'mt-1',
  mt2: 'mt-2',
  mt4: 'mt-4',
  mt12: 'mt-12',
  // Margin left
  ml6: 'ml-6',
  mlAuto: 'ml-auto',
  // Padding
  p1: 'p-1',
  pt8: 'pt-8',
  px2: 'px-2',
  px3: 'px-3',
  py2: 'py-2',
  pl4: 'pl-4',
  // Gap
  gap2: 'gap-2',
  gap3: 'gap-3',
  gap4: 'gap-4',
  gap8: 'gap-8',
  // Space between children
  spaceY1: 'space-y-1',
  spaceY2: 'space-y-2',
  spaceY3: 'space-y-3',
};

/**
 * Классы для typography (размеры и веса шрифтов)
 */
export const typographySizeClasses = {
  // Заголовки
  h1: 'text-4xl font-bold lg:text-5xl',
  h2: 'text-2xl font-bold',
  h3: 'text-lg font-semibold',
  // Текст
  body: 'text-base',
  bodyLarge: 'text-lg',
  bodySmall: 'text-sm',
  bodyXSmall: 'text-xs',
  // Веса
  bold: 'font-bold',
  semibold: 'font-semibold',
  medium: 'font-medium',
  // Выравнивание
  leadingRelaxed: 'leading-relaxed',
};

/**
 * Классы для списков
 */
export const listClassesExtended = {
  // Ordered list
  ordered: 'list-decimal list-inside',
  // Unordered list
  unordered: 'list-disc list-inside',
};

/**
 * Классы для utility (утилитарные классы)
 */
export const utilityClasses = {
  // Flex
  flex: 'flex',
  flex1: 'flex-1',
  flexCol: 'flex flex-col',
  flexColSmRow: 'flex flex-col sm:flex-row',
  justifyBetween: 'justify-between',
  minW0: 'min-w-0',
  flexShrink0: 'flex-shrink-0',
  // Overflow
  overflowXAuto: 'overflow-x-auto',
  // Position
  sticky: 'sticky top-32',
  absolute: 'absolute',
  left0: 'left-0',
  top0: 'top-0',
  bottom0: 'bottom-0',
  // Responsive
  hiddenLgBlock: 'hidden lg:block',
  // Width
  wFull: 'w-full',
  w64: 'w-64',
  w0_5: 'w-0.5',
  w1: 'w-1',
  lgW64: 'lg:w-64',
  // Max width
  maxW3xl: 'max-w-3xl',
  // Border radius
  roundedLg: 'rounded-lg',
  // Padding
  p4: 'p-4',
  // Ring
  ring1: 'ring-1 ring-black/5',
  // Last child
  lastBorderB0: 'last:border-b-0',
  // Transform
  rotate90: 'rotate-90',
  // Transition
  transitionTransform: 'transition-transform',
  transitionTransformDuration: 'transition-transform duration-200',
  transitionColors: 'transition-colors',
  transitionAll: 'transition-all',
  // Group hover
  groupHoverTranslateXLeft: 'group-hover:-translate-x-1',
  groupHoverTranslateXRight: 'group-hover:translate-x-1',
  // Opacity
  opacity30: 'opacity-30',
  // Position для header
  fixed: 'fixed',
  z50: 'z-50',
  // Header specific
  headerContainer: 'container mx-auto',
  headerContent: 'relative flex items-center justify-between py-4 px-4',
  headerBackground: 'bg-white/80 backdrop-blur-md dark:bg-dark-2/80',
  headerFixed: 'fixed left-0 top-0 z-50 w-full',
  // Footer specific
  footerBorder: 'border-t',
  footerPadding: 'py-10',
  // Image
  imageLogo: 'h-8 object-contain',
  // Text size
  textSm: 'text-sm',
  // Hidden responsive
  hiddenSmInline: 'hidden sm:inline',
};

/**
 * Классы для logo
 */
export const logoClasses = {
  // Логотип в footer (инвертированный)
  footer: 'w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-black/5 bg-gray-900 text-white dark:bg-white dark:text-gray-900',
};

/**
 * Классы для полей ввода
 */
export const inputClasses = {
  // Базовый фон для Input и Textarea
  background: 'bg-white dark:bg-dark-3',
  // Placeholder цвет
  placeholder: 'placeholder:text-text-secondary',
  // Стандартные классы для select элементов (dropdown)
  default: 'w-full px-4 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50',
};

/**
 * Классы для админ-панели (специальная цветовая схема)
 */
export const adminClasses = {
  // Фон сайдбара админки (темный slate)
  sidebarBackground: 'bg-slate-900 dark:bg-slate-950',
  // Фон контента админки
  contentBackground: 'bg-gray-1 dark:bg-dark',
  // Граница сайдбара
  sidebarBorder: 'border-slate-700 dark:border-slate-800',
  // Текст в сайдбаре (неактивный)
  sidebarText: 'text-slate-400 dark:text-slate-500',
  // Текст в сайдбаре (активный)
  sidebarTextActive: 'text-purple-400 dark:text-purple-300',
  // Hover текст в сайдбаре
  sidebarTextHover: 'hover:text-purple-400 dark:hover:text-purple-300',
  // Hover фон в сайдбаре
  sidebarHover: 'hover:bg-slate-800 dark:hover:bg-slate-900',
  // Активный фон в сайдбаре
  sidebarActive: 'bg-slate-800 dark:bg-slate-900 bg-purple-500/10 dark:bg-purple-500/20',
  // Граница активного элемента
  sidebarActiveBorder: 'border-purple-500',
  // Фон дропдауна в сайдбаре
  sidebarDropdown: 'bg-slate-800/50 dark:bg-slate-900/50 border-purple-500/50',
  // Overlay для мобильного сайдбара
  sidebarOverlay: 'bg-slate-900/80 dark:bg-slate-950/80',
};

/**
 * Классы для ссылок
 */
export const linkClasses = {
  // Основная ссылка (primary цвет)
  primary: 'text-primary hover:text-primary/80 transition-colors',
  // Вторичная ссылка
  secondary: 'text-text-secondary hover:text-text-primary transition-colors',
  // Ссылка с иконкой
  withIcon: 'inline-flex items-center gap-1',
};

/**
 * Объект со всеми классами темы
 */
export const themeClasses = {
  page: pageClasses,
  card: cardClasses,
  list: listClasses,
  listExtended: listClassesExtended,
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
  link: linkClasses,
  layout: layoutClasses,
  typography: typographyClasses,
  table: tableClasses,
  active: activeClasses,
  spacing: spacingClasses,
  typographySize: typographySizeClasses,
  utility: utilityClasses,
  logo: logoClasses,
  admin: adminClasses,
};

export default themeClasses;

