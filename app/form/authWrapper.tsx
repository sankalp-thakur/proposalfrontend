'use client';

import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { validateSession, initiateLogin, logout } from './authUtils';
import { AUTH_CONFIG } from './authConfig';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ProtectedComponentProps {
  user: User | null;
  onLogout: () => Promise<void>;
  [key: string]: any;
}

export function withAuth<P extends object>(Component: React.ComponentType<P & ProtectedComponentProps>) {
  return function ProtectedComponent(props: P): JSX.Element {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const handleLogout = useCallback(async () => {
      const result = await logout();
      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
        router.push('/');
      } else {
        setError(result.error || 'Logout failed');
      }
    }, [router]);

    useEffect(() => {
      const checkAuthentication = async () => {
        try {
          setIsLoading(true);
          setError(null);

          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Bypassing authentication');
            setUser({
              id: 1,
              name: 'Test User',
              email: 'test@example.com'
            });
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }

          const result = await validateSession();
          if (!result.isValid) {
            setError(result.error || 'Session invalid');
            initiateLogin();
            return;
          }

          setUser(result.user || null);
          setIsAuthenticated(true);
        } catch (error: any) {
          setError(error.message || 'Authentication error');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuthentication();
    }, []);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1A3721]">
          <div className="text-center">
            <div className="text-[#CCFF00] text-xl font-semibold mb-4">Loading...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CCFF00] mx-auto"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1A3721]">
          <div className="text-center">
            <div className="text-red-500 text-xl font-semibold mb-4">Authentication Error</div>
            <div className="text-white mb-4">{error}</div>
            <button 
              onClick={initiateLogin}
              className="px-4 py-2 bg-[#CCFF00] text-[#1A3721] rounded hover:bg-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <></>;
    }

    return <Component {...props as P} user={user} onLogout={handleLogout} />;
  };
}
