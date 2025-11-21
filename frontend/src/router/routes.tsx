import { lazy } from 'react';

// Landing
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

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

// Error Page - статический импорт, так как нужен для обработки ошибок загрузки других модулей
import ErrorPage from '@/pages/ErrorPage';

export {
  LandingPage,
  AboutPage,
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
  ErrorPage,
};
