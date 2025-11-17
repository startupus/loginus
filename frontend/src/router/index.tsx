import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { LandingPage } from './routes';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white dark:bg-dark">Loading...</div>}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white dark:bg-dark">Loading...</div>}>
        <LandingPage />
      </Suspense>
    ),
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
