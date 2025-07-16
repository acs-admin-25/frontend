'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { getJwtToken } from '@/lib/auth/auth-utils';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      // Only check JWT token if user is authenticated
      if (status === 'authenticated') {
        const jwtToken = getJwtToken();
        if (!jwtToken) {
          console.warn('No JWT token found, redirecting to unauthorized');
          router.push('/unauthorized');
          return;
        }
      }
      setIsCheckingAuth(false);
    };

    // Add a small delay to ensure tokens are available
    const timer = setTimeout(checkAuthentication, 100);
    
    return () => clearTimeout(timer);
  }, [status, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading while checking authentication or NextAuth is loading
  if (status === 'loading' || isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (status === 'authenticated' && !isCheckingAuth) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard; 