import { lazy } from 'react';

// Landing
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'));

// Dashboard - критическая страница, загружаем lazy для оптимизации
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

// Auth
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const VerifyCodePage = lazy(() => import('@/pages/auth/VerifyCodePage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const OnboardingPage = lazy(() => import('@/pages/auth/OnboardingPage'));

// Dashboard (static import to avoid dynamic import fetch issues)

// Personal Data
const DataPage = lazy(() => import('@/pages/DataPage'));
const PersonalDocumentsPage = lazy(() => import('@/pages/PersonalDocumentsPage'));
const PersonalAddressesPage = lazy(() => import('@/pages/PersonalAddressesPage'));
const FamilyPage = lazy(() => import('@/pages/FamilyPage'));
const WorkPage = lazy(() => import('@/pages/WorkPage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));

// Finance
const PayPage = lazy(() => import('@/pages/PayPage'));

// Support
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));

// Help Articles
const AuthorizationHelpPage = lazy(() => import('@/pages/help/AuthorizationHelpPage'));
const RegistrationHelpPage = lazy(() => import('@/pages/help/RegistrationHelpPage'));
const SecurityHelpPage = lazy(() => import('@/pages/help/SecurityHelpPage'));
const RecoveryHelpPage = lazy(() => import('@/pages/help/RecoveryHelpPage'));
const KeyHelpPage = lazy(() => import('@/pages/help/KeyHelpPage'));
const FamilyHelpPage = lazy(() => import('@/pages/help/FamilyHelpPage'));
const DataHelpPage = lazy(() => import('@/pages/help/DataHelpPage'));
const PaymentsHelpPage = lazy(() => import('@/pages/help/PaymentsHelpPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const UsersManagementPage = lazy(() => import('@/pages/admin/UsersManagementPage'));
const CompaniesManagementPage = lazy(() => import('@/pages/admin/CompaniesManagementPage'));
const CompanyDetailPage = lazy(() => import('@/pages/admin/CompanyDetailPage'));
const AuthFlowBuilderPage = lazy(() => import('@/pages/admin/AuthFlowBuilderPage'));
const BackupSettingsPage = lazy(() => import('@/pages/admin/BackupSettingsPage'));
const MenuSettingsPage = lazy(() => import('@/pages/admin/MenuSettingsPage'));
const PaymentMethodsPage = lazy(() => import('@/pages/admin/PaymentMethodsPage'));

// Custom Pages
const IframePage = lazy(() => import('@/pages/IframePage'));
const EmbeddedAppPage = lazy(() => import('@/pages/EmbeddedAppPage'));

// Error Page - статический импорт, так как нужен для обработки ошибок загрузки других модулей
import ErrorPage from '@/pages/ErrorPage';

export {
  LandingPage,
  AboutPage,
  FeaturesPage,
  AuthPage,
  VerifyCodePage,
  RegisterPage,
  OnboardingPage,
  DashboardPage,
  DataPage,
  PersonalDocumentsPage,
  PersonalAddressesPage,
  FamilyPage,
  WorkPage,
  SecurityPage,
  PayPage,
  SupportPage,
  HelpPage,
  AuthorizationHelpPage,
  RegistrationHelpPage,
  SecurityHelpPage,
  RecoveryHelpPage,
  KeyHelpPage,
  FamilyHelpPage,
  DataHelpPage,
  PaymentsHelpPage,
  AdminDashboardPage,
  UsersManagementPage,
  CompaniesManagementPage,
  CompanyDetailPage,
  AuthFlowBuilderPage,
  BackupSettingsPage,
  MenuSettingsPage,
  PaymentMethodsPage,
  IframePage,
  EmbeddedAppPage,
  ErrorPage,
};
