/**
 * File: hooks/useCentralizedDashboardData.ts
 * Purpose: Centralized hook for fetching and processing dashboard data used across all sections
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.1.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import { useOptimisticConversations } from '@/lib/hooks/useOptimisticConversations';
import { 
  calculateDashboardMetrics, 
  generateAnalytics, 
  filterConversationsByDateRange,
  sortConversations,
  groupConversationsByStatus,
  calculateUsageStats
} from '@/lib/utils/dashboard';
import type { DashboardData, DashboardUsage, DateRange } from '@/types/dashboard';
import type { Conversation } from '@/types/conversation';

interface UseCentralizedDashboardDataOptions {
  dateRange?: DateRange;
  sortBy?: 'date' | 'name' | 'status' | 'priority';
  sortOrder?: 'asc' | 'desc';
  statusFilter?: 'all' | 'active' | 'completed' | 'flagged' | 'spam';
  searchQuery?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useCentralizedDashboardData(options: UseCentralizedDashboardDataOptions = {}) {
  const {
    dateRange,
    sortBy = 'date',
    sortOrder = 'desc',
    statusFilter = 'all',
    searchQuery = '',
    autoRefresh = false,
    refreshInterval = 30000
  } = options;

  const [usageData, setUsageData] = useState<DashboardUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  // Use the new optimistic conversations hook
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    lastUpdated,
    refresh: refreshConversations,
    storageStats
  } = useOptimisticConversations({
    autoRefresh,
    refreshInterval,
    checkNewEmails: true
  });

  // Fetch usage stats
  const fetchUsageStats = useCallback(async () => {
    setUsageLoading(true);
    setUsageError(null);

    try {
      const response = await apiClient.getUsageStats();
      
      if (response.success) {
        setUsageData(response.data as DashboardUsage);
      } else {
        setUsageError(response.error || 'Failed to fetch usage stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading usage stats';
      setUsageError(errorMessage);
      console.error('[useCentralizedDashboardData] Error loading usage stats:', err);
    } finally {
      setUsageLoading(false);
    }
  }, []);

  // Load usage stats on mount
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  // Filter and sort conversations based on options
  const processedConversations = useMemo(() => {
    if (!conversations) return [];

    let filtered = conversations;

    // Apply date range filter
    if (dateRange?.startDate && dateRange?.endDate) {
      filtered = filterConversationsByDateRange(filtered, dateRange.startDate, dateRange.endDate);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const grouped = groupConversationsByStatus(filtered);
      switch (statusFilter) {
        case 'active':
          filtered = grouped.active;
          break;
        case 'completed':
          filtered = grouped.completed;
          break;
        case 'flagged':
          filtered = grouped.flagged;
          break;
        case 'spam':
          filtered = grouped.spam;
          break;
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        (conv.thread.lead_name || '').toLowerCase().includes(query) ||
        (conv.thread.client_email || '').toLowerCase().includes(query) ||
        (conv.thread.location || '').toLowerCase().includes(query) ||
        conv.messages.some(msg => 
          msg.body.toLowerCase().includes(query) ||
          (msg.subject || '').toLowerCase().includes(query)
        )
      );
    }

    // Apply sorting
    return sortConversations(filtered, sortBy, sortOrder);
  }, [conversations, dateRange, statusFilter, searchQuery, sortBy, sortOrder]);

  // Calculate filtered metrics
  const filteredMetrics = useMemo(() => {
    if (!conversations) return null;
    
    const totalFiltered = processedConversations.length;
    const completedFiltered = processedConversations.filter(c => c.thread.completed).length;
    const conversionRate = totalFiltered > 0 ? Math.round((completedFiltered / totalFiltered) * 100) : 0;

    return {
      totalConversations: totalFiltered,
      activeConversations: processedConversations.filter(c => !c.thread.completed).length,
      totalLeads: totalFiltered,
      conversionRate,
    };
  }, [conversations, processedConversations]);

  // Calculate usage stats
  const usageStats = useMemo(() => {
    if (!usageData) return null;
    return calculateUsageStats(usageData);
  }, [usageData]);

  // Combine data into dashboard format
  const dashboardData = useMemo(() => {
    if (!conversations || !usageData) {
      console.log('[useCentralizedDashboardData] Missing data for dashboard:', {
        hasConversations: !!conversations,
        conversationsLength: conversations?.length,
        hasUsageData: !!usageData
      });
      return null;
    }

    console.log('[useCentralizedDashboardData] Creating dashboard data:', {
      conversationsLength: conversations.length,
      sampleConversation: conversations[0] ? {
        id: conversations[0].thread.conversation_id,
        lead_name: conversations[0].thread.lead_name
      } : null
    });

    return {
      metrics: calculateDashboardMetrics(conversations, usageData),
      conversations: conversations,
      analytics: generateAnalytics(conversations),
      recentActivity: [],
      usage: usageData,
    } as DashboardData;
  }, [conversations, usageData]);

  const refetch = useCallback(async () => {
    await Promise.all([
      refreshConversations(),
      fetchUsageStats()
    ]);
  }, [refreshConversations, fetchUsageStats]);

  return {
    // Raw data
    data: dashboardData,
    loading: conversationsLoading || usageLoading,
    error: conversationsError || usageError,
    lastUpdated,
    
    // Processed data
    conversations: processedConversations,
    metrics: filteredMetrics,
    analytics: dashboardData?.analytics,
    usage: usageData,
    usageStats,
    
    // Actions
    refetch,
    
    // Storage info
    storageStats,
    
    // Helper functions
    getConversationsByStatus: () => groupConversationsByStatus(processedConversations),
    getConversationById: (id: string) => processedConversations.find(c => c.thread.conversation_id === id),
  };
}

// Specialized hooks for different dashboard sections
export function useLeadsData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'all',
    sortBy: 'date',
  });
}

export function useConversationsData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'active',
    sortBy: 'date',
  });
}

export function useAnalyticsData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'all',
    sortBy: 'date',
  });
}

export function useHistoryData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'completed',
    sortBy: 'date',
  });
}

export function useUsageData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'all',
    sortBy: 'date',
  });
}

export function useJunkData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'spam',
    sortBy: 'date',
  });
}

export function useEmailData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'all'
  });
}

export function useContactsData(options: Omit<UseCentralizedDashboardDataOptions, 'statusFilter'> = {}) {
  return useCentralizedDashboardData({
    ...options,
    statusFilter: 'all'
  });
} 