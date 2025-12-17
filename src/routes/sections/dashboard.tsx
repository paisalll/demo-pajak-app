import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/dashboard'));
const InputPage = lazy(() => import('src/pages/dashboard/input'));
const CoaPage = lazy(() => import('src/pages/dashboard/coa'));
const UserPage = lazy(() => import('src/pages/dashboard/user'));
const VendorPage = lazy(() => import('src/pages/dashboard/vendor'));
const CustomerPage = lazy(() => import('src/pages/dashboard/customer'));
const TaxPage = lazy(() => import('src/pages/dashboard/tax'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <IndexPage />, index: true },
      { path: 'input', 
        children: [
          { element: <InputPage />, index: true },
          { path: 'detail/:id', element: <InputPage /> },
        ],
      },
      { path: 'coa', 
        children: [
          { element: <CoaPage />, index: true },
        ],
      },
      {
        path: 'master',
        // Bungkus children master dengan Guard
        element: (
          <RoleBasedGuard hasContent roles={['admin']}>
            <Outlet /> {/* Atau wrapper master layout */}
          </RoleBasedGuard>
        ),
        children: [
          { path: 'users', element: <UserPage /> },
          { path: 'vendor', element: <VendorPage /> },
          { path: 'customer', element: <CustomerPage /> },
          { path: 'tax', element: <TaxPage /> },
        ],
      },
    ],
  },
];
