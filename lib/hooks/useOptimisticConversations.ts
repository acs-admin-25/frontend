/**
 * File: hooks/useOptimisticConversations.ts
 * Purpose: Centralized hook for optimistic conversation management with persistent storage
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Session } from 'next-auth';
import { apiClient } from '@/lib/api/client';
import { conversationStorage } from '@/lib/utils/ConversationStorage';
import { checkForNewEmailsShared, processThreadsResponse } from '@/lib/utils/api';
import type { Conversation } from '@/types/conversation';
import type { ThreadUpdate } from '@/types/api';

interface UseOptimisticConversationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  checkNewEmails?: boolean;
}

interface UseOptimisticConversationsReturn {
  // Data
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refresh: () => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => Promise<boolean>;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  markAsRead: (conversationId: string) => Promise<boolean>;
  markAsSpam: (conversationId: string, isSpam: boolean) => Promise<boolean>;
  toggleLcp: (conversationId: string) => Promise<boolean>;
  
  // Storage info
  storageStats: {
    hasData: boolean;
    isStale: boolean;
    conversationCount: number;
    lastUpdated: string | null;
  };
}

export function useOptimisticConversations(options: UseOptimisticConversationsOptions = {}): UseOptimisticConversationsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    checkNewEmails = true,
  } = options;

  const { data: session, status } = useSession() as { 
    data: (Session & { user: { id: string } }) | null; 
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize API client and storage when user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !isInitialized) {
      apiClient.initialize(session.user.id);
      setIsInitialized(true);
    }
  }, [status, session?.user?.id, isInitialized]);

  // Load conversations from storage or API
  const loadConversations = useCallback(async (forceRefresh = false) => {
    if (!session?.user?.id) {
      console.log('[useOptimisticConversations] No session user ID, skipping load');
      return;
    }

    console.log('[useOptimisticConversations] Loading conversations:', {
      forceRefresh,
      hasSession: !!session,
      userId: session.user.id,
      hasCachedData: conversationStorage.hasData(),
      isStale: conversationStorage.isStale(10)
    });

    setLoading(true);
    setError(null);

    try {
      // Check if we have cached data and it's not stale
      if (!forceRefresh && conversationStorage.hasData() && !conversationStorage.isStale(10)) {
        const cachedConversations = conversationStorage.getConversations();
        if (cachedConversations) {
          console.log('[useOptimisticConversations] Using cached data:', {
            conversationCount: cachedConversations.length,
            sampleConversation: cachedConversations[0] ? {
              id: cachedConversations[0].thread.conversation_id,
              lead_name: cachedConversations[0].thread.lead_name,
              messagesCount: cachedConversations[0].messages.length
            } : null
          });
          setConversations(cachedConversations);
          setLastUpdated(new Date());
          return;
        }
      }

      console.log('[useOptimisticConversations] Fetching from API...');
      // Fetch from API
      const response = await apiClient.getThreads();
      
      console.log('[useOptimisticConversations] API response:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : null,
        dataLength: response.data?.data?.length,
        error: response.error
      });
      
      if (response.success && response.data?.data) {
        console.log('[useOptimisticConversations] Processing API response data...');
        const processedConversations = processThreadsResponse(response.data.data);
        console.log('[useOptimisticConversations] Processed conversations:', {
          processedCount: processedConversations.length,
          sampleProcessed: processedConversations[0] ? {
            id: processedConversations[0].thread.conversation_id,
            lead_name: processedConversations[0].thread.lead_name,
            messagesCount: processedConversations[0].messages.length,
            lastMessageAt: processedConversations[0].thread.lastMessageAt
          } : null
        });
        
        setConversations(processedConversations);
        setLastUpdated(new Date());
        
        // Store in local storage
        conversationStorage.storeConversations(processedConversations);
        console.log('[useOptimisticConversations] Fetched and stored conversations');
      } else {
        console.error('[useOptimisticConversations] API response failed:', response);
        throw new Error(response.error || 'Failed to fetch conversations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading conversations';
      setError(errorMessage);
      console.error('[useOptimisticConversations] Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Check for new emails
  const checkForNewEmails = useCallback(async () => {
    if (!session?.user?.id) return;
    
    await checkForNewEmailsShared(session.user.id, async () => {
      await loadConversations(true);
    });
  }, [session?.user?.id, loadConversations]);

  // Initial load
  useEffect(() => {
    if (isInitialized) {
      loadConversations();
    }
  }, [isInitialized, loadConversations]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !isInitialized) return;

    refreshIntervalRef.current = setInterval(() => {
      loadConversations();
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, isInitialized, loadConversations]);

  // New email check setup
  useEffect(() => {
    if (!checkNewEmails || !isInitialized) return;

    // Check for new emails when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[useOptimisticConversations] Page became visible, checking for new emails...');
        checkForNewEmails();
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkNewEmails, isInitialized, checkForNewEmails]);

  // Optimistic update conversation
  const updateConversation = useCallback(async (conversationId: string, updates: Partial<Conversation>): Promise<boolean> => {
    try {
      // Apply optimistic update to local state
      setConversations(prev => 
        prev.map(conv => 
          conv.thread.conversation_id === conversationId
            ? { ...conv, ...updates }
            : conv
        )
      );

      // Apply optimistic update to storage
      conversationStorage.updateConversation(conversationId, updates);

      // Send update to server
      const response = await apiClient.updateThread(conversationId, updates.thread as ThreadUpdate);
      
      if (!response.success) {
        // Rollback optimistic update on failure
        console.warn('[useOptimisticConversations] Update failed, rolling back optimistic update');
        await loadConversations(true);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[useOptimisticConversations] Error updating conversation:', err);
      // Rollback optimistic update on error
      await loadConversations(true);
      return false;
    }
  }, [loadConversations]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      // Apply optimistic update to local state
      setConversations(prev => 
        prev.filter(conv => conv.thread.conversation_id !== conversationId)
      );

      // Apply optimistic update to storage
      conversationStorage.removeConversation(conversationId);

      // Send delete to server
      const response = await apiClient.deleteThread(conversationId);
      
      if (!response.success) {
        // Rollback optimistic update on failure
        console.warn('[useOptimisticConversations] Delete failed, rolling back optimistic update');
        await loadConversations(true);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[useOptimisticConversations] Error deleting conversation:', err);
      // Rollback optimistic update on error
      await loadConversations(true);
      return false;
    }
  }, [loadConversations]);

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string): Promise<boolean> => {
    return updateConversation(conversationId, {
      thread: {
        conversation_id: conversationId,
        read: true
      } as any
    });
  }, [updateConversation]);

  // Mark as spam/not spam
  const markAsSpam = useCallback(async (conversationId: string, isSpam: boolean): Promise<boolean> => {
    if (isSpam) {
      return updateConversation(conversationId, {
        thread: {
          conversation_id: conversationId,
          spam: true
        } as any
      });
    } else {
      // Use the specific markNotSpam endpoint
      try {
        const response = await apiClient.markNotSpam(conversationId);
        if (response.success) {
          // Update local state
          setConversations(prev => 
            prev.map(conv => 
              conv.thread.conversation_id === conversationId
                ? { ...conv, thread: { ...conv.thread, spam: false } }
                : conv
            )
          );
          return true;
        }
        return false;
      } catch (err) {
        console.error('[useOptimisticConversations] Error marking as not spam:', err);
        return false;
      }
    }
  }, [updateConversation]);

  // Toggle LCP
  const toggleLcp = useCallback(async (conversationId: string): Promise<boolean> => {
    const conversation = conversations.find(c => c.thread.conversation_id === conversationId);
    if (!conversation) return false;

    const currentLcpEnabled = conversation.thread.lcp_enabled || false;
    
    return updateConversation(conversationId, {
      thread: {
        conversation_id: conversationId,
        lcp_enabled: !currentLcpEnabled
      } as any
    });
  }, [conversations, updateConversation]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await loadConversations(true);
  }, [loadConversations]);

  // Get storage statistics
  const storageStats = conversationStorage.getStats();

  return {
    // Data
    conversations,
    loading,
    error,
    lastUpdated,
    
    // Actions
    refresh,
    updateConversation,
    deleteConversation,
    markAsRead,
    markAsSpam,
    toggleLcp,
    
    // Storage info
    storageStats
  };
} 