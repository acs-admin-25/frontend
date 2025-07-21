import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { verifySessionCookie, getStoredTokens, isTokenExpired, clearStoredTokens } from '@/lib/auth/auth-utils';
import type { User } from '@/lib/types/auth';

interface UseSessionVerificationOptions {
  redirectTo?: string;
  enabled?: boolean;
}

interface UseSessionVerificationReturn {
  isSessionValid: boolean;
  isChecking: boolean;
  verifySession: () => boolean;
  backendUser: User | null;
  refreshUser: () => Promise<void>;
}

/**
 * Enhanced custom hook for verifying session with backend integration
 * @param options Configuration options for session verification
 * @returns Object containing session verification state and methods
 */
export const useSessionVerification = (
  options: UseSessionVerificationOptions = {}
): UseSessionVerificationReturn => {
  const { redirectTo = '/unauthorized', enabled = true } = options;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSessionValid, setIsSessionValid] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [backendUser, setBackendUser] = useState<User | null>(null);

  const verifySession = (): boolean => {
    // Check both NextAuth session and backend tokens
    const hasNextAuthSession = !!session;
    const tokens = getStoredTokens();
    const hasValidTokens = tokens && !isTokenExpired();
    
    const isValid = hasNextAuthSession || hasValidTokens;
    setIsSessionValid(isValid);
    return isValid;
  };

  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const tokens = getStoredTokens();
      if (!tokens || isTokenExpired()) {
        throw new Error('No valid tokens');
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setBackendUser(data.data.user);
        } else {
          throw new Error('Invalid user data');
        }
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      clearStoredTokens();
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  };

  useEffect(() => {
    if (!enabled) {
      setIsChecking(false);
      return;
    }

    const checkSession = async () => {
      // Check if user is authenticated
      if (status === 'authenticated') {
        const isValid = verifySession();
        if (isValid) {
          // Try to fetch backend user data
          await fetchCurrentUser();
        } else if (redirectTo) {
          router.push(redirectTo);
        }
      } else if (status === 'unauthenticated') {
        // Check if we have stored tokens
        const tokens = getStoredTokens();
        if (tokens && !isTokenExpired()) {
          // We have valid tokens, try to get user data
          await fetchCurrentUser();
        } else {
          // No valid session or tokens
          clearStoredTokens();
          if (redirectTo) {
            router.push(redirectTo);
          }
        }
      }
      setIsChecking(false);
    };

    // Add a small delay to ensure cookies are available
    const timer = setTimeout(checkSession, 100);
    
    return () => clearTimeout(timer);
  }, [status, session, router, redirectTo, enabled]);

  return {
    isSessionValid,
    isChecking,
    verifySession,
    backendUser,
    refreshUser: fetchCurrentUser,
  };
};

// Enhanced auth hook with permissions
export function useAuth() {
  const { isSessionValid, isChecking, backendUser, refreshUser } = useSessionVerification();

  const hasPermission = (permission: string): boolean => {
    if (!backendUser) return false;
    
    // Check user role first
    if (backendUser.role === 'admin') return true;
    
    // Check specific permissions based on role
    const permissions: Record<string, string[]> = {
      user: [
        'view_conversations',
        'edit_settings',
        'read:own',
        'write:own',
        'view_dashboard',
        'send_emails',
        'view_contacts',
        'view_calendar'
      ],
      member: [
        'view_conversations',
        'edit_settings',
        'read:own',
        'write:own',
        'read:team',
        'view_dashboard',
        'send_emails',
        'view_contacts',
        'view_calendar',
        'manage_users'
      ],
    };
    
    const userPermissions = permissions[backendUser.role] || permissions.user;
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };

  return {
    isAuthenticated: isSessionValid && !!backendUser,
    isLoading: isChecking,
    user: backendUser,
    refreshUser,
    hasPermission,
  };
} 