import { useMemo, useState, useCallback } from 'react';
import { useHistoryData } from '@/lib/hooks/useCentralizedDashboardData';
import type { HistoryMetrics, HistoryData, HistoryFilters } from '@/types/history';
import type { Conversation } from '@/types/conversation';

export function useHistory(filters?: HistoryFilters): HistoryData {
  const { conversations, loading, error, refetch, lastUpdated } = useHistoryData();

  // Filter conversations based on provided filters
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];

    let filtered = conversations;

    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter((c: Conversation) => {
        if (filters.status === 'completed') return c.thread.completed;
        if (filters.status === 'active') return !c.thread.completed;
        return true;
      });
    }

    // Filter by date range
    if (filters?.dateRange) {
      const { startDate, endDate } = filters.dateRange;
      filtered = filtered.filter((c: Conversation) => {
        const conversationDate = new Date(c.thread.createdAt);
        return conversationDate >= startDate && conversationDate <= endDate;
      });
    }

    // Filter by search query
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((c: Conversation) => 
        (c.thread.lead_name || '').toLowerCase().includes(query) ||
        (c.thread.client_email || '').toLowerCase().includes(query) ||
        (c.thread.location || '').toLowerCase().includes(query) ||
        c.messages.some(msg => 
          msg.body.toLowerCase().includes(query) ||
          (msg.subject || '').toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [conversations, filters]);

  const metrics: HistoryMetrics = useMemo(() => {
    if (!filteredConversations || filteredConversations.length === 0) {
      return {
        totalConversations: 0,
        completedConversations: 0,
        completionRate: 0,
        averageDuration: 0,
        successRate: 0,
        averageMessages: 0,
        monthlyGrowth: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        historicalGrowth: 0,
      };
    }

    const completed = filteredConversations.filter((c: Conversation) => c.thread.completed);
    const total = filteredConversations.length;
    const completionRate = total > 0 ? (completed.length / total) * 100 : 0;
    
    // Calculate message statistics
    const totalMessages = filteredConversations.reduce((sum: number, c: Conversation) => sum + (c.messages?.length || 0), 0);
    const averageMessages = total > 0 ? totalMessages / total : 0;
    
    // Calculate duration statistics (placeholder - would need actual start/end times)
    const averageDuration = completed.length > 0 ? 15 : 0; // minutes
    
    // Calculate success rate based on completion and positive outcomes
    const successRate = completed.length > 0 ? 85 : 0; // placeholder - would need actual success criteria
    
    // Calculate response time (placeholder - would need actual response time data)
    const averageResponseTime = total > 0 ? 5 : 0; // minutes
    
    // Calculate growth metrics
    const monthlyGrowth = 12; // placeholder percentage
    const historicalGrowth = 8; // placeholder percentage

    return {
      totalConversations: total,
      completedConversations: completed.length,
      completionRate: Math.round(completionRate),
      averageDuration,
      successRate,
      averageMessages: Math.round(averageMessages),
      monthlyGrowth,
      totalMessages,
      averageResponseTime,
      historicalGrowth,
    };
  }, [filteredConversations]);

  const handleRefetch = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Error refetching history data:', err);
    }
  }, [refetch]);

  return {
    conversations: filteredConversations,
    metrics,
    loading,
    error,
    refetch: handleRefetch,
    lastUpdated,
  };
} 