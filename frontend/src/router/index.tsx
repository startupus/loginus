import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { LandingPage, AboutPage, FeaturesPage, AuthPage, VerifyCodePage, RegisterPage, OnboardingPage, DashboardPage, PersonalDocumentsPage, PersonalAddressesPage, FamilyPage, WorkPage, SecurityPage, DataPage, PayPage, SupportPage, HelpPage, AuthorizationHelpPage, RegistrationHelpPage, SecurityHelpPage, RecoveryHelpPage, KeyHelpPage, FamilyHelpPage, DataHelpPage, PaymentsHelpPage, AdminDashboardPage, UsersManagementPage, CompaniesManagementPage, CompanyDetailPage, AuthFlowBuilderPage, BackupSettingsPage, MenuSettingsPage, PaymentMethodsPage, IframePage, EmbeddedAppPage, ErrorPage, FamilyInvitePage } from './routes';
import { LanguageRoute } from './LanguageRoute';
import { AdminRoute } from './AdminRoute';
import { themeClasses } from '../design-system/utils/themeClasses';

const LoadingFallback = () => (
  <div className={`flex items-center justify-center min-h-screen ${themeClasses.background.default}`}>
    Loading...
  </div>
);

// Компонент для редиректа с сохранением query параметров
const InvitationRedirect: React.FC = () => {
  const location = useLocation();
  const search = location.search || '';
  console.log('[InvitationRedirect] Redirecting from:', location.pathname + location.search);
  console.log('[InvitationRedirect] Redirecting to:', `/ru/invitation${search}`);
  return <Navigate to={`/ru/invitation${search}`} replace />;
};

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
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/about',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AboutPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/features',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FeaturesPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/data',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <DataPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/data/documents',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PersonalDocumentsPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/data/addresses',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PersonalAddressesPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  // Редиректы со старого пути /personal на новый /data для обратной совместимости
  {
    path: '/:lang/personal',
    element: <Navigate to="../data" replace />,
  },
  {
    path: '/:lang/personal/documents',
    element: <Navigate to="../data/documents" replace />,
  },
  {
    path: '/:lang/personal/addresses',
    element: <Navigate to="../data/addresses" replace />,
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
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/family/invite',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FamilyInvitePage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/invitation',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FamilyInvitePage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/invitation',
    element: <InvitationRedirect />,
  },
  {
    path: '/:lang/work',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <WorkPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/authorization',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AuthorizationHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/registration',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <RegistrationHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/security',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <SecurityHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/recovery',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <RecoveryHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/key',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <KeyHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/family',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FamilyHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/data',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <DataHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/help/payments',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PaymentsHelpPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  // Административные маршруты
  {
    path: '/:lang/admin',
    element: (
      <LanguageRoute>
        <AdminRoute>
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboardPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/admin/users',
    element: (
      <LanguageRoute>
        <AdminRoute>
          <Suspense fallback={<LoadingFallback />}>
            <UsersManagementPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/admin/companies',
    element: (
      <LanguageRoute>
        <AdminRoute requiredRole="super_admin">
          <Suspense fallback={<LoadingFallback />}>
            <CompaniesManagementPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/admin/companies/:id',
    element: (
      <LanguageRoute>
        <AdminRoute requiredRole="super_admin">
          <Suspense fallback={<LoadingFallback />}>
            <CompanyDetailPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/admin/auth-flow',
    element: (
      <LanguageRoute>
        <AdminRoute>
          <Suspense fallback={<LoadingFallback />}>
            <AuthFlowBuilderPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/admin/backup',
    element: (
      <LanguageRoute>
        <AdminRoute>
          <Suspense fallback={<LoadingFallback />}>
            <BackupSettingsPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/admin/menu-settings',
    element: (
      <LanguageRoute>
        <AdminRoute>
          <Suspense fallback={<LoadingFallback />}>
            <MenuSettingsPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/admin/payment-methods',
    element: (
      <LanguageRoute>
        <AdminRoute>
          <Suspense fallback={<LoadingFallback />}>
            <PaymentMethodsPage />
          </Suspense>
        </AdminRoute>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/iframe',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <IframePage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:lang/embedded',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <EmbeddedAppPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    // Новый маршрут для embedded web_app плагинов по slug (id пункта меню)
    path: '/:lang/plugins/:slug',
    element: (
      <LanguageRoute>
        <Suspense fallback={<LoadingFallback />}>
          <EmbeddedAppPage />
        </Suspense>
      </LanguageRoute>
    ),
    errorElement: <ErrorPage />,
  },
  // Редирект старых маршрутов без языка
  {
    path: '/about',
    element: <Navigate to="/ru/about" replace />,
  },
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
    path: '/data',
    element: <Navigate to="/ru/data" replace />,
  },
  {
    path: '/data/documents',
    element: <Navigate to="/ru/data/documents" replace />,
  },
  {
    path: '/data/addresses',
    element: <Navigate to="/ru/data/addresses" replace />,
  },
  // Редиректы со старого пути /personal на новый /data для обратной совместимости
  {
    path: '/personal',
    element: <Navigate to="/ru/data" replace />,
  },
  {
    path: '/personal/documents',
    element: <Navigate to="/ru/data/documents" replace />,
  },
  {
    path: '/personal/addresses',
    element: <Navigate to="/ru/data/addresses" replace />,
  },
  {
    path: '/family',
    element: <Navigate to="/ru/family" replace />,
  },
  {
    path: '/family/invite',
    element: <Navigate to="/ru/family/invite" replace />,
  },
  {
    path: '/work',
    element: <Navigate to="/ru/work" replace />,
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
