import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api/client';

/**
 * Hook to manage API client with JWT authentication
 * Automatically sets the backend JWT token from NextAuth session
 */
export function useApiAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Set the backend JWT token from the session
      const backendToken = (session as any).backendToken;
      if (backendToken) {
        apiClient.setBackendToken(backendToken);
        console.log('[useApiAuth] Backend JWT token set from session');
      } else {
        console.warn('[useApiAuth] No backend JWT token found in session');
        apiClient.clearBackendToken();
      }
    } else if (status === 'unauthenticated') {
      // Clear the token when user is not authenticated
      apiClient.clearBackendToken();
      console.log('[useApiAuth] Backend JWT token cleared - user unauthenticated');
    }
  }, [session, status]);

  return {
    apiClient,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    session
  };
} 