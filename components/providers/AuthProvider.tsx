'use client';

import { SessionProvider } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { handleSessionCookie, storeAuthTokens } from '@/lib/auth/auth-utils';

// Enhanced AuthProvider that integrates with backend authentication
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthIntegrationWrapper>
        {children}
      </AuthIntegrationWrapper>
    </SessionProvider>
  );
}

// Wrapper component to handle backend integration
function AuthIntegrationWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      // Handle session cookie for backend compatibility
      handleSessionCookie(session);
      
      // Store tokens if available
      if ((session as any).tokens) {
        storeAuthTokens((session as any).tokens);
      }
    }
  }, [session]);

  return <>{children}</>;
} 