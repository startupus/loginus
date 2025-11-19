import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LandingPage, AuthPage, VerifyCodePage, RegisterPage, OnboardingPage, DashboardPage, PersonalDocumentsPage, PersonalAddressesPage, FamilyPage, SecurityPage, PersonalPage, PayPage, SupportPage, HelpPage, ErrorPage } from './routes';
import { LanguageRoute } from './LanguageRoute';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-dark">
    Loading...
  </div>
);

const router = createBrowserRouter([
  // Редирект с корня на язык по умолчанию
  {
    path: '/',
    element: <Navigate to="/ru" replace />,
  },
  // Все маршруты с параметром языка
  {
    path: '/:lang',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/auth',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AuthPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/auth/verify',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <VerifyCodePage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/auth/register',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <RegisterPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/onboarding',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <OnboardingPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/dashboard',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <DashboardPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/personal',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PersonalPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/personal/documents',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PersonalDocumentsPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/personal/addresses',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PersonalAddressesPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/family',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FamilyPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/security',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <SecurityPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/pay',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PayPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/support',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <SupportPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  {
    path: '/:lang/help',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <HelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorPage />
      </Suspense>
    ),
  },
  // Редирект старых маршрутов без языка
  {
    path: '/auth',
    element: <Navigate to="/ru/auth" replace />,
  },
  {
    path: '/auth/verify',
    element: <Navigate to="/ru/auth/verify" replace />,
  },
  {
    path: '/auth/register',
    element: <Navigate to="/ru/auth/register" replace />,
  },
  {
    path: '/onboarding',
    element: <Navigate to="/ru/onboarding" replace />,
  },
  {
    path: '/dashboard',
    element: <Navigate to="/ru/dashboard" replace />,
  },
  {
    path: '/personal',
    element: <Navigate to="/ru/personal" replace />,
  },
  {
    path: '/personal/documents',
    element: <Navigate to="/ru/personal/documents" replace />,
  },
  {
    path: '/personal/addresses',
    element: <Navigate to="/ru/personal/addresses" replace />,
  },
  {
    path: '/family',
    element: <Navigate to="/ru/family" replace />,
  },
  {
    path: '/security',
    element: <Navigate to="/ru/security" replace />,
  },
  {
    path: '/pay',
    element: <Navigate to="/ru/pay" replace />,
  },
  {
    path: '/support',
    element: <Navigate to="/ru/support" replace />,
  },
  {
    path: '/help',
    element: <Navigate to="/ru/help" replace />,
  },
  // 404 - редирект на главную с языком по умолчанию
  {
    path: '*',
    element: <Navigate to="/ru" replace />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
