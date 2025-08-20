'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'OWNER' | 'STAFF';
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    // If authenticated but doesn't have required role, redirect to unauthorized
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      // For now, redirect to home page if user doesn't have required role
      // You can create an unauthorized page later if needed
      router.push('/');
      return;
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Check role authorization
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component version for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'OWNER' | 'STAFF'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}