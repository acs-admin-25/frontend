'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { handleSessionCookie, getJwtToken, setJwtToken, clearJwtToken } from '@/lib/auth/auth-utils';

/**
 * Custom hook for managing JWT token authentication with GCP
 * Handles token storage, retrieval, and session management
 */
export function useAuth() {
  const { data: session, status } = useSession();

  // Handle JWT token management when session changes
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Store JWT token from session
      handleSessionCookie(session);
      
      // Also store in localStorage for API client access
      if ((session as any).sessionToken) {
        setJwtToken((session as any).sessionToken);
      }
    } else if (status === 'unauthenticated') {
      // Clear JWT token when user is not authenticated
      clearJwtToken();
    }
  }, [session, status]);

  const getToken = (): string | null => {
    return getJwtToken();
  };

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    getToken,
  };
} 