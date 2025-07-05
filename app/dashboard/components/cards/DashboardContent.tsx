import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardMetrics } from './DashboardMetrics';
import { RecentConversations } from './RecentConversations';
import { QuickResources } from './QuickResources';
import { AnalyticsSnippet } from './AnalyticsSnippet';
import { useDashboardSettings } from './DashboardSettings';
import { WelcomeHeader } from '@/app/dashboard/components/cards/WelcomeHeader';
import { UsageOverview } from './UsageOverview';
import type { DashboardData } from '@/types/dashboard';

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

    const filteredConversations = data.conversations.filter(conv => {
      // Use lastMessageAt for filtering recent conversations, fallback to createdAt
      const convDate = new Date(conv.thread.lastMessageAt || conv.thread.createdAt);
      return convDate >= dateRange.from! && convDate <= dateRange.to!;
    });

    // Recalculate metrics based on filtered data
    const totalLeads = filteredConversations.length;
    const activeConversations = filteredConversations.filter(c => !c.thread.completed).length;
    const completedConversations = filteredConversations.filter(c => c.thread.completed).length;
    const conversionRate = totalLeads > 0 ? (completedConversations / totalLeads) * 100 : 0;

    // Calculate average response time from filtered conversations
    const responseTimes = filteredConversations
      .flatMap(c => c.messages)
      .filter(m => m.type === 'outbound-email')
      .map(m => new Date(m.timestamp).getTime() - new Date(m.localDate).getTime())
      .filter(time => time > 0);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000 / 60 // in minutes
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
    const newMessages = filteredData.conversations.filter(c => {
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

  // Calculate analytics snippet data
  const analyticsData = {
    totalLeads: filteredData.metrics.totalLeads,
    conversionRate: filteredData.metrics.conversionRate,
    activeConversations: filteredData.metrics.activeConversations,
    avgResponseTime: Math.round(filteredData.metrics.averageResponseTime || 0)
  };

  return (
    <div className="h-full bg-muted/50 overflow-y-auto">
      {/* Welcome Widget with Real Data */}
      <div className="mb-8">
        <WelcomeHeader 
          activeLeads={welcomeMetrics.activeLeads}
          newMessages={welcomeMetrics.newMessages}
          conversionRate={welcomeMetrics.conversionRate}
        />
      </div>

      <main className="flex-1 p-6 lg:p-8">
        {/* Enhanced Metrics Row */}
        {settings.showMetrics && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Key Performance Metrics</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <span>•</span>
                <span>{filteredData.conversations.length} conversations in selected range</span>
              </div>
            </div>
            <DashboardMetrics 
              data={filteredData.metrics} 
              conversations={data.conversations}
            />
          </div>
        )}
        
        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            {/* Recent Conversations */}
            <RecentConversations conversations={filteredData.conversations} />

            {/* Usage Overview */}
            {settings.showUsage && (
              <UsageOverview usage={data.usage} />
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Analytics Snippet */}
            {settings.showAnalyticsSnippet && (
              <AnalyticsSnippet data={analyticsData} />
            )}

            {/* Quick Resources */}
            {settings.showResources && (
              <QuickResources />
            )}
          </div>
        </div>

        {/* Additional Grid Row for Larger Screens */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Placeholder for future widgets or additional content */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
              <p className="text-muted-foreground">Additional widgets can be added here to provide more insights.</p>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
              <p className="text-muted-foreground">Common actions and shortcuts can be placed here for easy access.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 