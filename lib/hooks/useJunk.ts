/**
 * File: hooks/useJunk.ts
 * Purpose: Centralized hook for junk/spam management with real API integration
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import { processThreadsResponse } from '@/lib/utils/api';
import type { 
  JunkData, 
  JunkMetrics, 
  JunkStats, 
  JunkFilters, 
  UseJunkOptions,
  JunkManagementActions,
  SpamPattern,
  JunkAction,
  JunkAnalytics
} from '@/types/junk';
import type { Conversation } from '@/types/conversation';

// Extended Thread interface for spam-related properties
interface SpamThread {
  flagged?: boolean;
  spam_detected?: boolean;
  false_positive?: boolean;
  spam_type?: 'generic' | 'suspicious_link' | 'bot_behavior' | 'other';
  spam_pattern?: string;
  spam_confidence?: number;
  reviewed?: boolean;
  restored?: boolean;
  deleted?: boolean;
  lead_email?: string;
}

// Extended Conversation interface
interface SpamConversation extends Omit<Conversation, 'thread'> {
  thread: Conversation['thread'] & SpamThread;
}

// Utility functions for junk/spam processing
function filterJunkConversations(conversations: Conversation[], filters: JunkFilters): SpamConversation[] {
  return conversations.filter(conv => {
    // Filter by spam status - use existing spam flag or check for flagged status
    const spamThread = conv.thread as SpamThread;
    if (spamThread.flagged || spamThread.spam_detected || conv.thread.spam) {
      // Apply additional filters
      if (filters.dateRange) {
        const convDate = new Date(conv.thread.createdAt);
        if (convDate < filters.dateRange.start || convDate > filters.dateRange.end) {
          return false;
        }
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matches = 
          conv.thread.lead_name?.toLowerCase().includes(query) ||
          spamThread.lead_email?.toLowerCase().includes(query) ||
          conv.messages.some(msg => msg.content?.toLowerCase().includes(query));
        
        if (!matches) return false;
      }

      return true;
    }
    return false;
  }) as SpamConversation[];
}

function calculateJunkMetrics(conversations: SpamConversation[]): JunkMetrics {
  const totalSpamDetected = conversations.length;
  const totalFiltered = conversations.filter(c => (c.thread as SpamThread).flagged).length;
  const falsePositives = conversations.filter(c => (c.thread as SpamThread).false_positive).length;
  
  // Calculate spam by type
  const spamByType = {
    genericMessages: conversations.filter(c => (c.thread as SpamThread).spam_type === 'generic').length,
    suspiciousLinks: conversations.filter(c => (c.thread as SpamThread).spam_type === 'suspicious_link').length,
    botBehavior: conversations.filter(c => (c.thread as SpamThread).spam_type === 'bot_behavior').length,
    other: conversations.filter(c => {
      const spamType = (c.thread as SpamThread).spam_type;
      return !spamType || !['generic', 'suspicious_link', 'bot_behavior'].includes(spamType);
    }).length
  };

  // Calculate trends (simplified - in real app would use time-based data)
  const spamTrends = {
    daily: Math.floor(totalSpamDetected * 0.1),
    weekly: Math.floor(totalSpamDetected * 0.3),
    monthly: totalSpamDetected
  };

  // Calculate recent activity
  const recentActivity = {
    flagged: totalFiltered,
    reviewed: conversations.filter(c => (c.thread as SpamThread).reviewed).length,
    restored: conversations.filter(c => (c.thread as SpamThread).restored).length,
    deleted: conversations.filter(c => (c.thread as SpamThread).deleted).length
  };

  const detectionRate = totalSpamDetected > 0 ? Math.round((totalFiltered / totalSpamDetected) * 100) : 0;
  const accuracyRate = totalFiltered > 0 ? Math.round(((totalFiltered - falsePositives) / totalFiltered) * 100) : 0;

  return {
    totalSpamDetected,
    totalFiltered,
    falsePositives,
    detectionRate,
    accuracyRate,
    spamByType,
    spamTrends,
    recentActivity
  };
}

function calculateJunkStats(conversations: SpamConversation[]): JunkStats {
  const totalConversations = conversations.length;
  const flaggedConversations = conversations.filter(c => (c.thread as SpamThread).flagged).length;
  const reviewedConversations = conversations.filter(c => (c.thread as SpamThread).reviewed).length;
  const restoredConversations = conversations.filter(c => (c.thread as SpamThread).restored).length;
  const deletedConversations = conversations.filter(c => (c.thread as SpamThread).deleted).length;

  const falsePositiveRate = flaggedConversations > 0 ? 
    Math.round((conversations.filter(c => (c.thread as SpamThread).false_positive).length / flaggedConversations) * 100) : 0;
  
  const detectionAccuracy = flaggedConversations > 0 ? 
    Math.round(((flaggedConversations - conversations.filter(c => (c.thread as SpamThread).false_positive).length) / flaggedConversations) * 100) : 0;

  // Calculate average review time (simplified)
  const averageReviewTime = reviewedConversations > 0 ? 15 : 0; // minutes

  return {
    totalConversations,
    flaggedConversations,
    reviewedConversations,
    restoredConversations,
    deletedConversations,
    falsePositiveRate,
    detectionAccuracy,
    averageReviewTime,
    spamPatterns: [],
    recentActions: []
  };
}

function detectSpamPatterns(conversations: SpamConversation[]): SpamPattern[] {
  const patterns: Record<string, SpamPattern> = {};

  conversations.forEach(conv => {
    const spamThread = conv.thread as SpamThread;
    const spamType = spamThread.spam_type || 'other';
    const pattern = spamThread.spam_pattern || 'unknown';
    
    if (!patterns[pattern]) {
      patterns[pattern] = {
        id: pattern,
        pattern,
        type: spamType as any,
        confidence: spamThread.spam_confidence || 0.5,
        occurrences: 0,
        firstDetected: new Date(conv.thread.createdAt),
        lastDetected: new Date(conv.thread.createdAt)
      };
    }

    patterns[pattern].occurrences++;
    const convDate = new Date(conv.thread.createdAt);
    if (convDate > patterns[pattern].lastDetected) {
      patterns[pattern].lastDetected = convDate;
    }
  });

  return Object.values(patterns).sort((a, b) => b.occurrences - a.occurrences);
}

function generateJunkAnalytics(conversations: SpamConversation[], actions: JunkAction[]): JunkAnalytics {
  // Generate spam trends by date
  const spamTrends = conversations.reduce((acc: any[], conv) => {
    const spamThread = conv.thread as SpamThread;
    const date = new Date(conv.thread.createdAt).toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.flagged++;
      if (spamThread.reviewed) existing.reviewed++;
      if (spamThread.restored) existing.restored++;
      if (spamThread.deleted) existing.deleted++;
    } else {
      acc.push({
        date,
        flagged: 1,
        reviewed: spamThread.reviewed ? 1 : 0,
        restored: spamThread.restored ? 1 : 0,
        deleted: spamThread.deleted ? 1 : 0
      });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  // Generate spam by source
  const sourceCounts = conversations.reduce((acc: Record<string, number>, conv) => {
    const source = conv.thread.source_name || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const totalSpam = conversations.length;
  const spamBySource = Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    count,
    percentage: Math.round((count / totalSpam) * 100)
  })).sort((a, b) => b.count - a.count);

  // Generate spam by time
  const timeCounts = conversations.reduce((acc: Record<number, number>, conv) => {
    const hour = new Date(conv.thread.createdAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const spamByTime = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: timeCounts[hour] || 0
  }));

  // False positive analysis
  const totalReviews = actions.filter(a => a.action === 'review').length;
  const falsePositives = conversations.filter(c => (c.thread as SpamThread).false_positive).length;
  const accuracyRate = totalReviews > 0 ? Math.round(((totalReviews - falsePositives) / totalReviews) * 100) : 0;

  const falsePositiveAnalysis = {
    totalReviews,
    falsePositives,
    accuracyRate,
    commonFalsePositivePatterns: conversations
      .filter(c => (c.thread as SpamThread).false_positive)
      .map(c => (c.thread as SpamThread).spam_pattern)
      .filter((pattern): pattern is string => Boolean(pattern))
      .slice(0, 5)
  };

  return {
    spamTrends,
    spamBySource,
    spamByTime,
    falsePositiveAnalysis
  };
}

export function useJunk(options: UseJunkOptions = {}): JunkData & JunkManagementActions & { analytics: JunkAnalytics | null } {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    filters = {},
    includeDeleted = false,
    limit = 100
  } = options;

  // State management
  const [conversations, setConversations] = useState<SpamConversation[]>([]);
  const [metrics, setMetrics] = useState<JunkMetrics | null>(null);
  const [stats, setStats] = useState<JunkStats | null>(null);
  const [patterns, setPatterns] = useState<SpamPattern[]>([]);
  const [actions, setActions] = useState<JunkAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentFilters, setCurrentFilters] = useState<JunkFilters>(filters);

  // Fetch junk conversations from API
  const fetchJunkConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch conversations with spam filter
      const response = await apiClient.request<{ data: any[] }>('lcp/get_all_threads', {
        method: 'POST',
        body: {
          ...currentFilters,
          spam_filter: true,
          include_deleted: includeDeleted,
          limit
        }
      });

      if (response.success && response.data?.data) {
        const rawConversations = response.data.data;
        const processedConversations = processThreadsResponse(rawConversations);
        
        // Filter for spam/junk conversations
        const junkConversations = filterJunkConversations(processedConversations, currentFilters);
        setConversations(junkConversations);

        // Calculate metrics and stats
        const junkMetrics = calculateJunkMetrics(junkConversations);
        const junkStats = calculateJunkStats(junkConversations);
        const spamPatterns = detectSpamPatterns(junkConversations);

        setMetrics(junkMetrics);
        setStats(junkStats);
        setPatterns(spamPatterns);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch junk conversations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading junk data';
      setError(errorMessage);
      console.error('[useJunk] Error loading junk conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters, includeDeleted, limit]);

  // Fetch junk actions history
  const fetchJunkActions = useCallback(async () => {
    try {
      const response = await apiClient.request<JunkAction[]>('junk/actions', {
        method: 'GET'
      });

      if (response.success && response.data) {
        const actions = response.data.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }));
        setActions(actions);
      }
    } catch (err) {
      console.error('[useJunk] Error loading junk actions:', err);
    }
  }, []);

  // Flag conversation as spam
  const flagConversation = useCallback(async (conversationId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await apiClient.request('junk/flag', {
        method: 'POST',
        body: {
          conversation_id: conversationId,
          reason: reason || 'Manual flag',
          timestamp: new Date().toISOString()
        }
      });

      if (response.success) {
        // Update local state
        setConversations(prev => 
          prev.map(conv => 
            conv.thread.conversation_id === conversationId 
              ? { ...conv, thread: { ...conv.thread, flagged: true } }
              : conv
          )
        );
        
        // Refresh data
        await fetchJunkConversations();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useJunk] Error flagging conversation:', err);
      return false;
    }
  }, [fetchJunkConversations]);

  // Unflag conversation
  const unflagConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const response = await apiClient.request('junk/unflag', {
        method: 'POST',
        body: {
          conversation_id: conversationId,
          timestamp: new Date().toISOString()
        }
      });

      if (response.success) {
        // Update local state
        setConversations(prev => 
          prev.map(conv => 
            conv.thread.conversation_id === conversationId 
              ? { ...conv, thread: { ...conv.thread, flagged: false } }
              : conv
          )
        );
        
        await fetchJunkConversations();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useJunk] Error unflagging conversation:', err);
      return false;
    }
  }, [fetchJunkConversations]);

  // Restore conversation
  const restoreConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const response = await apiClient.request('junk/restore', {
        method: 'POST',
        body: {
          conversation_id: conversationId,
          timestamp: new Date().toISOString()
        }
      });

      if (response.success) {
        // Remove from junk list
        setConversations(prev => 
          prev.filter(conv => conv.thread.conversation_id !== conversationId)
        );
        
        await fetchJunkConversations();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useJunk] Error restoring conversation:', err);
      return false;
    }
  }, [fetchJunkConversations]);

  // Delete conversation permanently
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const response = await apiClient.request('junk/delete', {
        method: 'POST',
        body: {
          conversation_id: conversationId,
          timestamp: new Date().toISOString()
        }
      });

      if (response.success) {
        // Remove from junk list
        setConversations(prev => 
          prev.filter(conv => conv.thread.conversation_id !== conversationId)
        );
        
        await fetchJunkConversations();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useJunk] Error deleting conversation:', err);
      return false;
    }
  }, [fetchJunkConversations]);

  // Review conversation (manual review)
  const reviewConversation = useCallback(async (
    conversationId: string, 
    action: 'flag' | 'restore' | 'delete'
  ): Promise<boolean> => {
    try {
      const response = await apiClient.request('junk/review', {
        method: 'POST',
        body: {
          conversation_id: conversationId,
          action,
          timestamp: new Date().toISOString()
        }
      });

      if (response.success) {
        await fetchJunkConversations();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useJunk] Error reviewing conversation:', err);
      return false;
    }
  }, [fetchJunkConversations]);

  // Bulk actions
  const bulkAction = useCallback(async (
    conversationIds: string[], 
    action: 'flag' | 'restore' | 'delete'
  ): Promise<boolean> => {
    try {
      const response = await apiClient.request('junk/bulk', {
        method: 'POST',
        body: {
          conversation_ids: conversationIds,
          action,
          timestamp: new Date().toISOString()
        }
      });

      if (response.success) {
        await fetchJunkConversations();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useJunk] Error performing bulk action:', err);
      return false;
    }
  }, [fetchJunkConversations]);

  // Update filters
  const updateFilters = useCallback((newFilters: JunkFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchJunkConversations(),
      fetchJunkActions()
    ]);
  }, [fetchJunkConversations, fetchJunkActions]);

  // Generate analytics
  const analytics = useMemo((): JunkAnalytics | null => {
    if (!conversations.length) return null;
    return generateJunkAnalytics(conversations, actions);
  }, [conversations, actions]);

  // Initial data fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refetch, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Refetch when filters change
  useEffect(() => {
    fetchJunkConversations();
  }, [fetchJunkConversations]);

  return {
    // Data
    conversations,
    metrics: metrics || {
      totalSpamDetected: 0,
      totalFiltered: 0,
      falsePositives: 0,
      detectionRate: 0,
      accuracyRate: 0,
      spamByType: { genericMessages: 0, suspiciousLinks: 0, botBehavior: 0, other: 0 },
      spamTrends: { daily: 0, weekly: 0, monthly: 0 },
      recentActivity: { flagged: 0, reviewed: 0, restored: 0, deleted: 0 }
    },
    stats: stats || {
      totalConversations: 0,
      flaggedConversations: 0,
      reviewedConversations: 0,
      restoredConversations: 0,
      deletedConversations: 0,
      falsePositiveRate: 0,
      detectionAccuracy: 0,
      averageReviewTime: 0,
      spamPatterns: [],
      recentActions: []
    },
    patterns,
    actions,
    loading,
    error,
    lastUpdated,

    // Actions
    flagConversation,
    unflagConversation,
    restoreConversation,
    deleteConversation,
    reviewConversation,
    bulkAction,
    updateFilters,
    refetch,

    // Additional data
    analytics
  };
} 