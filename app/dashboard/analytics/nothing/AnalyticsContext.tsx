/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This AnalyticsContext is in a "nothing" folder and is never imported or used.
 * The main analytics page (app/dashboard/analytics/page.tsx) uses useAnalyticsData()
 * hook directly instead of this context.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

"use client"

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useAnalyticsData } from '@/lib/hooks/useCentralizedDashboardData';
import type { 
  AnalyticsData, 
  AnalyticsFilters, 
  AnalyticsState, 
  AnalyticsContextType,
  EVDataPoint 
} from '@/types/analytics';

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { 
    conversations, 
    data,
    analytics,
    loading, 
    error, 
    refetch,
    lastUpdated
  } = useAnalyticsData();

  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30d',
    conversationStatus: 'all',
    leadSource: '',
    searchQuery: ''
  });

  // Use the full dashboard metrics instead of filtered metrics
  const metrics = data?.metrics;

  // Process conversations based on filters
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];

    let filtered = conversations;

    // Filter by status
    if (filters.conversationStatus && filters.conversationStatus !== 'all') {
      filtered = filtered.filter(conv => {
        if (filters.conversationStatus === 'completed') return conv.thread.completed;
        if (filters.conversationStatus === 'active') return !conv.thread.completed;
        if (filters.conversationStatus === 'flagged') return conv.thread.flag || conv.thread.flag_for_review;
        return true;
      });
    }

    // Filter by lead source
    if (filters.leadSource) {
      filtered = filtered.filter(conv => 
        conv.thread.source_name?.toLowerCase().includes(filters.leadSource!.toLowerCase())
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
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

    // Filter by date range
    if (filters.dateRange !== 'custom' && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      filtered = filtered.filter(conv => {
        const convDate = new Date(conv.thread.createdAt);
        return convDate >= startDate && convDate <= now;
      });
    }

    return filtered;
  }, [conversations, filters]);

  // Calculate key metrics from filtered data
  const keyMetrics = useMemo(() => {
    if (!filteredConversations || filteredConversations.length === 0) {
      return [
        { title: 'Total Leads', value: '0', trend: '0%', trendDirection: 'neutral' as const, color: 'blue' },
        { title: 'Conversion Rate', value: '0%', trend: '0%', trendDirection: 'neutral' as const, color: 'green' },
        { title: 'Avg. Response Time', value: '0m', trend: '0m', trendDirection: 'neutral' as const, color: 'yellow' },
        { title: 'Active Leads', value: '0', trend: '0', trendDirection: 'neutral' as const, color: 'purple' },
      ];
    }

    const total = filteredConversations.length;
    const completed = filteredConversations.filter(conv => conv.thread.completed).length;
    const active = filteredConversations.filter(conv => !conv.thread.completed).length;
    const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate average response time (placeholder calculation)
    const averageResponseTime = total > 0 ? Math.round(Math.random() * 20 + 5) : 0;

    return [
      { 
        title: 'Total Leads', 
        value: total.toLocaleString(), 
        trend: '+12.5%', 
        trendDirection: 'up' as const, 
        color: 'blue',
        description: 'Total number of leads in the selected period'
      },
      { 
        title: 'Conversion Rate', 
        value: `${conversionRate}%`, 
        trend: '+2.1%', 
        trendDirection: 'up' as const, 
        color: 'green',
        description: 'Percentage of leads that converted'
      },
      { 
        title: 'Avg. Response Time', 
        value: `${averageResponseTime}m`, 
        trend: '-3m', 
        trendDirection: 'up' as const, 
        color: 'yellow',
        description: 'Average time to respond to leads'
      },
      { 
        title: 'Active Leads', 
        value: active.toString(), 
        trend: '+12 this week', 
        trendDirection: 'up' as const, 
        color: 'purple',
        description: 'Number of leads currently being worked'
      },
    ];
  }, [filteredConversations]);

  // Calculate EV by message data
  const evByMessage = useMemo(() => {
    if (!filteredConversations || filteredConversations.length === 0) {
      return [];
    }

    const evData: EVDataPoint[] = [];
    const maxMessages = Math.max(...filteredConversations.map(conv => conv.messages.length));

    for (let i = 1; i <= Math.min(maxMessages, 10); i++) {
      const conversationsWithMessage = filteredConversations.filter(conv => conv.messages.length >= i);
      const totalEV = conversationsWithMessage.reduce((sum, conv) => sum + (conv.thread.aiScore || 0), 0);
      const averageEV = conversationsWithMessage.length > 0 ? totalEV / conversationsWithMessage.length : 0;

      evData.push({
        messageNumber: i,
        averageEV: Math.round(averageEV * 100) / 100,
        totalMessages: conversationsWithMessage.length,
        conversationCount: conversationsWithMessage.length
      });
    }

    return evData;
  }, [filteredConversations]);

  // Create analytics data object
  const analyticsData = useMemo(() => {
    return {
      keyMetrics,
      evByMessage,
      dateRange: filters.dateRange,
      lastUpdated: lastUpdated?.toISOString() || new Date().toISOString(),
      conversations: filteredConversations,
      metrics: metrics || null,
      analytics: analytics || null
    };
  }, [keyMetrics, evByMessage, filters.dateRange, lastUpdated, filteredConversations, metrics, analytics]);

  const updateFilters = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getFilteredConversations = () => filteredConversations;
  const getMetrics = () => metrics || null;
  const getAnalytics = () => analytics || null;

  const contextValue: AnalyticsContextType = {
    data: analyticsData,
    loading,
    error,
    filters,
    lastUpdated,
    refetch,
    updateFilters,
    getFilteredConversations,
    getMetrics,
    getAnalytics
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
} 