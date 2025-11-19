import { lazy } from 'react';
import DashboardPage from '@/pages/DashboardPage';

// Landing
const LandingPage = lazy(() => import('@/pages/LandingPage'));

// Auth
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const VerifyCodePage = lazy(() => import('@/pages/auth/VerifyCodePage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const OnboardingPage = lazy(() => import('@/pages/auth/OnboardingPage'));

// Dashboard (static import to avoid dynamic import fetch issues)

// Personal Data
const PersonalPage = lazy(() => import('@/pages/PersonalPage'));
const PersonalDocumentsPage = lazy(() => import('@/pages/PersonalDocumentsPage'));
const PersonalAddressesPage = lazy(() => import('@/pages/PersonalAddressesPage'));
const FamilyPage = lazy(() => import('@/pages/FamilyPage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));

// Finance
const PayPage = lazy(() => import('@/pages/PayPage'));

// Support
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));

// Error Page
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));

export {
  LandingPage,
  AuthPage,
  VerifyCodePage,
  RegisterPage,
  OnboardingPage,
  DashboardPage,
  PersonalPage,
  PersonalDocumentsPage,
  PersonalAddressesPage,
  FamilyPage,
  SecurityPage,
  PayPage,
  SupportPage,
  HelpPage,
  ErrorPage,
};
