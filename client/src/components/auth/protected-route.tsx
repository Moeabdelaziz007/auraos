import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import LoadingPage from '@/pages/loading';
import LoginPage from '@/pages/login';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
