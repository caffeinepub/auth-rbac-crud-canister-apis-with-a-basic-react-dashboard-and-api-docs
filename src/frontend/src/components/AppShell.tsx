import { ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import { SiCoffeescript } from 'react-icons/si';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { identity, clear, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const isLoginPage = routerState.location.pathname === '/login';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const handleLogin = () => {
    navigate({ to: '/login' });
  };

  const handleDashboard = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center shadow-sm">
              <SiCoffeescript className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Secure Task Management</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {isAuthenticated && !isLoginPage && (
              <Button variant="ghost" size="sm" onClick={handleDashboard} className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            )}

            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingIn} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            ) : (
              !isLoginPage && (
                <Button variant="default" size="sm" onClick={handleLogin} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
