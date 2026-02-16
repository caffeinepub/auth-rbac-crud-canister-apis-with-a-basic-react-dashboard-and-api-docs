import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppShell from './components/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster />
    </>
  ),
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Dashboard route with auth guard
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

// Index route - redirect to dashboard or login
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }: any) => {
    const isAuthenticated = !!context?.identity;
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    throw redirect({ to: '/dashboard' });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, dashboardRoute]);

const router = createRouter({
  routeTree,
  context: {
    identity: undefined,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} context={{ identity }} />
    </ThemeProvider>
  );
}
