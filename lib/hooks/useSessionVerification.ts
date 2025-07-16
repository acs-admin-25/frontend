import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getJwtToken } from '@/lib/auth/auth-utils';

interface UseSessionVerificationOptions {
  redirectTo?: string;
  enabled?: boolean;
}

interface UseSessionVerificationReturn {
  isSessionValid: boolean;
  isChecking: boolean;
  verifySession: () => boolean;
}

/**
 * Custom hook for verifying JWT token presence
 * @param options Configuration options for session verification
 * @returns Object containing session verification state and methods
 */
export const useSessionVerification = (
  options: UseSessionVerificationOptions = {}
): UseSessionVerificationReturn => {
  const { redirectTo = '/unauthorized', enabled = true } = options;
  const { status } = useSession();
  const router = useRouter();
  const [isSessionValid, setIsSessionValid] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const verifySession = (): boolean => {
    const jwtToken = getJwtToken();
    const isValid = !!jwtToken;
    setIsSessionValid(isValid);
    return isValid;
  };

  useEffect(() => {
    if (!enabled) {
      setIsChecking(false);
      return;
    }

    const checkSession = () => {
      // Only check if user is authenticated
      if (status === 'authenticated') {
        const isValid = verifySession();
        if (!isValid && redirectTo) {
          router.push(redirectTo);
        }
      }
      setIsChecking(false);
    };

    // Add a small delay to ensure tokens are available
    const timer = setTimeout(checkSession, 100);
    
    return () => clearTimeout(timer);
  }, [status, router, redirectTo, enabled]);

  return {
    isSessionValid,
    isChecking,
    verifySession,
  };
}; 