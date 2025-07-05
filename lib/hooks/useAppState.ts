'use client';

import { useSession } from 'next-auth/react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useApiClient } from '@/components/providers/ApiProvider';
import type { User } from '@/types/auth';

export function useAppState() {
  const { data: session, status } = useSession();
  const { mode: theme, toggleTheme } = useTheme();
  const { apiClient } = useApiClient();

  const user = session?.user as User | undefined;

  return {
    user,
    session,
    theme,
    toggleTheme,
    apiClient,
    isAuthenticated: !!user && status === 'authenticated',
    isAdmin: user?.role === 'admin',
    isLoading: status === 'loading',
  };
} 