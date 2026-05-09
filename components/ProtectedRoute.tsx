'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireRole?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireRole,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isSuperAdmin, hasRole } = useAuthContext();
  const router = useRouter();

  const meetsRequirement =
    (!requireAdmin || isAdmin) &&
    (!requireSuperAdmin || isSuperAdmin) &&
    (!requireRole || hasRole(requireRole));

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!meetsRequirement) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, meetsRequirement, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !meetsRequirement) {
    return null;
  }

  return <>{children}</>;
}
