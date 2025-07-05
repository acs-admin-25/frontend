import type { Conversation, Message } from '@/types/conversation';
import type { AnalyticsData, EVDataPoint, AnalyticsFilters } from '@/types/analytics';
import { compareDates } from '@/lib/utils/date';

/**
 * Filters conversations based on analytics filters
 */
export function filterConversations(
  conversations: Conversation[], 
  filters: AnalyticsFilters
): Conversation[] {
  return conversations.filter(conversation => {
    // Filter by conversation status
    if (filters.conversationStatus && filters.conversationStatus !== 'all') {
      switch (filters.conversationStatus) {
        case 'active':
          if (conversation.thread.completed) return false;
          break;
        case 'completed':
          if (!conversation.thread.completed) return false;
          break;
        case 'flagged':
          if (!conversation.thread.flag && !conversation.thread.flag_for_review) return false;
          break;
      }
    }
    
    // Filter by lead source
    if (filters.leadSource && filters.leadSource !== 'all') {
      if (conversation.thread.source_name !== filters.leadSource) return false;
    }
    
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      const conversationDate = new Date(conversation.thread.lastMessageAt);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      
      if (startDate && conversationDate < startDate) return false;
      if (endDate && conversationDate > endDate) return false;
    }
    
    return true;
  });
}

/**
 * Calculates key metrics from filtered conversations
 */
export function calculateKeyMetrics(conversations: Conversation[]): {
  totalLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  activeLeads: number;
} {
  const totalLeads = conversations.length;
  const completedConversations = conversations.filter(c => c.thread.completed).length;
  const conversionRate = totalLeads > 0 ? (completedConversations / totalLeads) * 100 : 0;
  
  // Calculate average response time (simplified - in real app would use actual response times)
  const responseTimes: number[] = conversations
    .map(c => c.messages.length > 1 ? 12 : 0) // Mock data - replace with actual calculation
    .filter(time => time > 0);
  const averageResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0;
  
  const activeLeads = conversations.filter(c => !c.thread.completed).length;
  
  return {
    totalLeads,
    conversionRate,
    averageResponseTime,
    activeLeads
  };
}

/**
 * Formats metrics for display
 */
export function formatMetrics(metrics: ReturnType<typeof calculateKeyMetrics>) {
  return [
    {
      title: 'Total Leads',
      value: metrics.totalLeads.toLocaleString(),
      trend: '+12.5%',
      trendDirection: 'up' as const,
      description: 'Total number of leads in the selected period'
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      trend: '+2.1%',
      trendDirection: 'up' as const,
      description: 'Percentage of leads that converted'
    },
    {
      title: 'Avg. Response Time',
      value: `${Math.round(metrics.averageResponseTime)}m`,
      trend: '-3m',
      trendDirection: 'up' as const,
      description: 'Average time to respond to leads'
    },
    {
      title: 'Active Leads',
      value: metrics.activeLeads.toString(),
      trend: '+12 this week',
      trendDirection: 'up' as const,
      description: 'Number of leads currently being worked'
    }
  ];
}

/**
 * Generates mock analytics data for development
 */
export function generateMockAnalyticsData(filters: AnalyticsFilters): AnalyticsData {
  const mockConversations: Conversation[] = [
    // Mock conversation data would go here
    // This is a placeholder for development
  ];
  
  const filteredConversations = filterConversations(mockConversations, filters);
  const metrics = calculateKeyMetrics(filteredConversations);
  const evByMessage = calculateAverageEVByMessage(filteredConversations);
  
  return {
    keyMetrics: formatMetrics(metrics),
    evByMessage,
    dateRange: filters.dateRange,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calculates average EV score by message number across all conversations
 */
export function calculateAverageEVByMessage(conversations: Conversation[]): EVDataPoint[] {
  const messageEVMap = new Map<number, { totalEV: number; count: number; conversationCount: number }>();
  
  conversations.forEach(conversation => {
    const sortedMessages = [...conversation.messages].sort((a, b) => compareDates(a.localDate, b.localDate, true));
    
    sortedMessages.forEach((message, index) => {
      const messageNumber = index + 1;
      const evScore = message.ev_score;
      
      if (evScore !== null && evScore !== undefined && !isNaN(evScore)) {
        const current = messageEVMap.get(messageNumber) || { 
          totalEV: 0, 
          count: 0, 
          conversationCount: 0 
        };
        
        messageEVMap.set(messageNumber, {
          totalEV: current.totalEV + evScore,
          count: current.count + 1,
          conversationCount: current.conversationCount + 1
        });
      }
    });
  });
  
  return Array.from(messageEVMap.entries())
    .map(([messageNumber, data]) => ({
      messageNumber,
      averageEV: data.count > 0 ? data.totalEV / data.count : 0,
      totalMessages: data.count,
      conversationCount: data.conversationCount
    }))
    .sort((a, b) => a.messageNumber - b.messageNumber);
} 