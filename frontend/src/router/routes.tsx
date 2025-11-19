import { lazy } from 'react';

// Landing
const LandingPage = lazy(() => import('@/pages/LandingPage'));

// Auth
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const VerifyCodePage = lazy(() => import('@/pages/auth/VerifyCodePage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const OnboardingPage = lazy(() => import('@/pages/auth/OnboardingPage'));

// Dashboard
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

// Personal Data
const PersonalDocumentsPage = lazy(() => import('@/pages/PersonalDocumentsPage'));
const PersonalAddressesPage = lazy(() => import('@/pages/PersonalAddressesPage'));
const FamilyPage = lazy(() => import('@/pages/FamilyPage'));

// Error Page
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));

export {
  LandingPage,
  AuthPage,
  VerifyCodePage,
  RegisterPage,
  OnboardingPage,
  DashboardPage,
  PersonalDocumentsPage,
  PersonalAddressesPage,
  FamilyPage,
  ErrorPage,
};
