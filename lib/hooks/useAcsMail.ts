import { useProfile } from '@/lib/hooks/useProfile';

export function useAcsMail() {
  const { profile, isLoading, error } = useProfile();
  
  return {
    acsMail: profile?.acs_mail || null,
    loading: isLoading,
    error: error,
  };
} 