'use client';

import { useMemo, useEffect } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { processThreadsResponse, checkForNewEmailsShared } from '@/lib/utils/api';
import type { Conversation } from '@/types/conversation';

/**
 * Enhanced hook for fetching and processing all conversation threads.
 */
export function useThreadsApi(options: any = {}) {
  const { data: session } = useSession() as { data: (Session & { user: { id: string } }) | null };
  
  const { data: rawData, loading, error, refetch, mutate } = useApi<any>('lcp/get_all_threads', {
    method: 'POST',
    body: { userId: session?.user?.id },
    enabled: options.enabled !== false && !!session?.user?.id,
    ...options
  });

  const processedData = useMemo(() => {
    const threadsArray = rawData?.data || [];
    return processThreadsResponse(threadsArray);
  }, [rawData]);

  // Polling logic for new emails
  useEffect(() => {
    if (!options.polling || !session?.user?.id) return;

    // Check for new emails when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, checking for new emails...');
        checkForNewEmailsShared(session.user.id, refetch);
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [options.polling, session?.user?.id, refetch]);

  return {
    data: processedData,
    loading,
    error,
    refetch,
    mutate,
  };
}

/**
 * Hook to get a specific conversation by ID.
 */
export function useConversationById(conversationId: string, options: any = {}) {
  const { data: conversations, loading, error, refetch } = useThreadsApi({
    ...options,
    polling: true // Enable polling for real-time updates
  });

  const conversation = useMemo(() => {
    if (!conversations || !conversationId) return null;
    return conversations.find(conv => conv.thread.conversation_id === conversationId) || null;
  }, [conversations, conversationId]);

  return {
    conversation,
    loading,
    error,
    refetch,
  };
} 