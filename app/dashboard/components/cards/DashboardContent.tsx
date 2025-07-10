import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardMetrics } from './DashboardMetrics';
import { useDashboardSettings } from './DashboardSettings';
import { DashboardHeader } from '@/app/dashboard/components/cards/DashboardHeader';
import { DashboardTabs } from '../tabs/DashboardTabs';
import type { DashboardData } from '@/lib/types/dashboard';
import type { Conversation, Message } from '@/lib/types/conversation';

interface DashboardContentProps {
  data: DashboardData;
  onRefresh?: () => void;
}

export function DashboardContent({ 
  data, 
  onRefresh 
}: DashboardContentProps) {
  const { data: session } = useSession();
  const { settings } = useDashboardSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Filter data based on date range
  const filteredData = useMemo(() => {
    const { dateRange } = settings;
    if (!dateRange?.from || !dateRange?.to) {
      return data; // Return all data if range is incomplete
    }

    const filteredConversations = data.conversations.filter((conv: Conversation) => {
      // Use lastMessageAt for filtering recent conversations, fallback to createdAt
      const convDate = new Date(conv.thread.lastMessageAt || conv.thread.createdAt);
      return convDate >= dateRange.from! && convDate <= dateRange.to!;
    });

    // Recalculate metrics based on filtered data
    const totalLeads = filteredConversations.length;
    const activeConversations = filteredConversations.filter((c: Conversation) => !c.thread.completed).length;
    const completedConversations = filteredConversations.filter((c: Conversation) => c.thread.completed).length;
    const conversionRate = totalLeads > 0 ? (completedConversations / totalLeads) * 100 : 0;

    // Calculate average response time from filtered conversations
    const responseTimes = filteredConversations
      .flatMap((c: Conversation) => c.messages)
      .filter((m: Message) => m.type === 'outbound-email')
      .map((m: Message) => new Date(m.timestamp).getTime() - new Date(m.localDate).getTime())
      .filter((time: number) => time > 0);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length / 1000 / 60 // in minutes
      : 0;

    return {
      conversations: filteredConversations,
      metrics: {
        ...data.metrics,
        totalLeads,
        activeConversations,
        conversionRate,
        averageResponseTime
      }
    };
  }, [data, settings.dateRange]);

  // Calculate real-time metrics for welcome widget
  const calculateWelcomeMetrics = () => {
    const activeLeads = filteredData.metrics.activeConversations;
    const newMessages = filteredData.conversations.filter((c: Conversation) => {
      const lastMessage = c.messages[c.messages.length - 1];
      if (!lastMessage) return false;
      const messageDate = new Date(lastMessage.timestamp);
      const today = new Date();
      return messageDate.toDateString() === today.toDateString();
    }).length;
    const conversionRate = filteredData.metrics.conversionRate;

    return { activeLeads, newMessages, conversionRate };
  };

  const welcomeMetrics = calculateWelcomeMetrics();

  return (
    <div className="h-full bg-muted/50 overflow-y-auto">
      {/* Welcome Widget with Real Data */}
      <div className="mb-8 px-4 sm:px-6">
        <DashboardHeader 
          activeLeads={welcomeMetrics.activeLeads}
          newMessages={welcomeMetrics.newMessages}
          conversionRate={welcomeMetrics.conversionRate}
        />
      </div>

      <main className="flex-1">
        {/* Enhanced Metrics Row */}
        {settings.showMetrics && (
          <div className="mb-8 px-4 sm:px-6">
            <DashboardMetrics 
              data={filteredData.metrics} 
              conversations={data.conversations}
            />
          </div>
        )}

        {/* Dashboard Tabs below key metrics */}
        <div className="mb-8 px-4 sm:px-6">
          <DashboardTabs conversations={data.conversations} />
        </div>
        
        <div className="p-6 lg:p-8">
        
        {/* Content area - now empty after removing widgets */}
        
        </div>
      </main>
    </div>
  );
} 