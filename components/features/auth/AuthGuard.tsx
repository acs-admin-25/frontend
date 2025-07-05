'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { verifySessionCookie } from '@/lib/auth/auth-utils';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSessionCookie = () => {
      // Only check session cookie if user is authenticated
      if (status === 'authenticated') {
        const hasSessionCookie = verifySessionCookie();
        if (!hasSessionCookie) {
          router.push('/unauthorized');
          return;
        }
      }
      setIsCheckingSession(false);
    };

    // Add a small delay to ensure cookies are available
    const timer = setTimeout(checkSessionCookie, 100);
    
    return () => clearTimeout(timer);
  }, [status, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading while checking session or NextAuth is loading
  if (status === 'loading' || isCheckingSession) {
    return <LoadingSpinner />;
  }

  if (status === 'authenticated' && !isCheckingSession) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard; 