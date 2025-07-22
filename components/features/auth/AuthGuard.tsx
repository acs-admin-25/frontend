'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading while NextAuth is loading
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Show children if authenticated
  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard; 