/**
 * File: hooks/useDashboardData.ts
 * Purpose: Centralized hook for fetching and processing dashboard data
 * Data Flow: Data Source → Process Data → Conversation (containing Thread and Message) ← Used by Components
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { processThreadsResponse } from '@/lib/utils/api';
import { calculateAverageResponseTime, calculateMonthlyGrowth } from '@/lib/utils/dashboard';
import type { DashboardData, DashboardUsage } from '@/types/dashboard';
import type { Conversation } from '@/types/conversation';
import { subDays, format, differenceInDays } from 'date-fns';

function generateAnalytics(conversations: Conversation[]) {
    // Conversation Trend (Last 7 Days)
    const conversationTrendData = Array(7).fill(0);
    const labels = Array(7).fill(0).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'MMM d');
    });

    conversations.forEach(conv => {
        const date = new Date(conv.thread.createdAt);
        const diff = differenceInDays(new Date(), date);
        if (diff >= 0 && diff < 7) {
            const index = 6 - diff;
            conversationTrendData[index]++;
        }
    });

    // Lead Source Breakdown
    const sourceCounts = conversations.reduce((acc, conv) => {
        const source = conv.thread.source_name || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        conversationTrend: {
            labels,
            datasets: [{
                label: 'Conversations',
                data: conversationTrendData,
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
            }]
        },
        leadSourceBreakdown: {
            labels: Object.keys(sourceCounts),
            datasets: [{
                label: 'Lead Sources',
                data: Object.values(sourceCounts),
                backgroundColor: ['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#9013FE'],
            }]
        },
        responseTimeTrend: { labels: [], datasets: [] }, // Placeholder
        conversionFunnel: { labels: [], datasets: [] }, // Placeholder
        revenueTrend: { labels: [], datasets: [] }, // Placeholder
    };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [conversationsResponse, usageStatsResponse] = await Promise.all([
        apiClient.getThreads(),
        apiClient.request('usage/stats')
      ]);

      if (conversationsResponse.success) {
        const conversations: Conversation[] = processThreadsResponse(conversationsResponse.data?.data || []);
        
        const totalConversations = conversations.length;
        const completedConversations = conversations.filter(c => c.thread.completed).length;
        const conversionRate = totalConversations > 0 ? Math.round((completedConversations / totalConversations) * 100) : 0;

        const usageData = usageStatsResponse.success ? usageStatsResponse.data as DashboardUsage : {
          emailsSent: 0,
          logins: 0,
          activeDays: 0,
        };

        const dashboardData: DashboardData = {
          metrics: {
            totalConversations,
            activeConversations: conversations.filter((conv: Conversation) => !conv.thread.completed).length,
            totalLeads: totalConversations,
            conversionRate: conversionRate,
            averageResponseTime: calculateAverageResponseTime(conversations),
            monthlyGrowth: calculateMonthlyGrowth(conversations),
            totalRevenue: 0, // Placeholder
            averageDealSize: 0, // Placeholder
          },
          conversations: conversations,
          analytics: generateAnalytics(conversations),
          recentActivity: [],
          usage: usageData,
        };

        setData(dashboardData);
      } else {
        const errorMessage = `Failed to load conversations: ${conversationsResponse.error}`;
        console.error('[useDashboardData] Error:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading dashboard data';
      console.error('[useDashboardData] Unexpected error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
} 