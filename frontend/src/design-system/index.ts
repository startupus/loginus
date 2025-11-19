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
 * 
 * ОПТИМИЗАЦИЯ: Для лучшей производительности используйте прямые импорты из подразделов:
 * import { Button } from '@/design-system/primitives';
 * import { Modal } from '@/design-system/composites';
 * import { Header } from '@/design-system/layouts';
 */

// ============================================================================
// PRIMITIVES (Atoms) - Базовые компоненты
// ============================================================================
export { Button } from './primitives/Button';
export type { ButtonProps } from './primitives/Button';

export { Input } from './primitives/Input';
export type { InputProps } from './primitives/Input';

export { Badge } from './primitives/Badge';
export type { BadgeProps } from './primitives/Badge';

export { Avatar } from './primitives/Avatar';
export type { AvatarProps } from './primitives/Avatar';

export { Icon } from './primitives/Icon';
export type { IconProps } from './primitives/Icon';

export { Separator } from './primitives/Separator';
export type { SeparatorProps } from './primitives/Separator';

export { CodeInput } from './primitives/CodeInput';
export type { CodeInputProps } from './primitives/CodeInput';

export { UniversalInput } from './primitives/UniversalInput';
export type { UniversalInputProps } from './primitives/UniversalInput';

export { Logo } from './primitives/Logo';
export type { LogoProps } from './primitives/Logo';

export { Checkbox } from './primitives/Checkbox';
export type { CheckboxProps } from './primitives/Checkbox';

// ============================================================================
// COMPOSITES (Molecules) - Составные компоненты
// ============================================================================
export { Modal } from './composites/Modal';
export type { ModalProps } from './composites/Modal';

export { Switch } from './composites/Switch';
export type { SwitchProps } from './composites/Switch';

export { Tabs } from './composites/Tabs';
export type { TabsProps, Tab } from './composites/Tabs';

export { DataSection } from './composites/DataSection';
export type { DataSectionProps } from './composites/DataSection';

export { SeparatedList } from './composites/SeparatedList';
export type { SeparatedListProps } from './composites/SeparatedList';

export { WidgetCard } from './composites/WidgetCard';
export type { WidgetCardProps } from './composites/WidgetCard';

export { MasonryGrid } from './composites/MasonryGrid';
export type { MasonryGridProps } from './composites/MasonryGrid';

export { AddButton } from './composites/AddButton';
export type { AddButtonProps } from './composites/AddButton';

export { AuthPageLayout } from './composites/AuthPageLayout';
export type { AuthPageLayoutProps } from './composites/AuthPageLayout';

export { ContactDisplay } from './composites/ContactDisplay';
export type { ContactDisplayProps } from './composites/ContactDisplay';

export { ErrorMessage } from './composites/ErrorMessage';
export type { ErrorMessageProps } from './composites/ErrorMessage';

export { ResendTimer } from './composites/ResendTimer';
export type { ResendTimerProps } from './composites/ResendTimer';

export { ServiceLink } from './composites/ServiceLink';
export type { ServiceLinkProps } from './composites/ServiceLink';

export { PhoneVerificationCard } from './composites/PhoneVerificationCard';
export type { PhoneVerificationCardProps } from './composites/PhoneVerificationCard';

export { ProfilePopup } from './composites/ProfilePopup';
export type { ProfilePopupProps, UserProfile } from './composites/ProfilePopup';

export { ServiceCard } from './composites/ServiceCard';
export type { ServiceCardProps } from './composites/ServiceCard';

export { FeatureCard } from './composites/FeatureCard';
export type { FeatureCardProps } from './composites/FeatureCard';

export { FAQItem } from './composites/FAQItem';
export type { FAQItemProps } from './composites/FAQItem';

export { SectionHeader } from './composites/SectionHeader';
export type { SectionHeaderProps } from './composites/SectionHeader';

export { TrustIndicator } from './composites/TrustIndicator';
export type { TrustIndicatorProps } from './composites/TrustIndicator';

export { LinkButton } from './composites/LinkButton';
export type { LinkButtonProps } from './composites/LinkButton';

export { ProgressBar } from './composites/ProgressBar';
export type { ProgressBarProps } from './composites/ProgressBar';

// ============================================================================
// LAYOUTS (Organisms) - Макеты страниц
// ============================================================================
export { LandingHeader } from './layouts/LandingHeader';
export type { LandingHeaderProps } from './layouts/LandingHeader';

export { Sidebar } from './layouts/Sidebar';
export type { SidebarProps, SidebarItem } from './layouts/Sidebar';

export { PageTemplate } from './layouts/PageTemplate';
export type { PageTemplateProps } from './layouts/PageTemplate';

export { Footer } from './layouts/Footer';
export type { FooterProps } from './layouts/Footer';

export { Header } from './layouts/Header';
export type { HeaderProps } from './layouts/Header';

// ============================================================================
// CONTEXTS - React контексты
// ============================================================================
export * from './contexts';

// ============================================================================
// HOOKS - Custom hooks
// ============================================================================
export * from './hooks';

// ============================================================================
// UTILS - Утилиты
// ============================================================================
export * from './utils/themeUtils';
export * from './utils/responsiveUtils';

// ============================================================================
// THEMES - Темы и токены
// ============================================================================
export * from './themes/tokens';
export { generateClientTheme, presetClientThemes } from './themes/clientTheme';
export type { ClientThemeConfig } from './themes/clientTheme';


