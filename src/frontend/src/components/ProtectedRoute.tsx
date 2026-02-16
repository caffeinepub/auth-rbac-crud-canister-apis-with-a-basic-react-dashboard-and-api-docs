import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
