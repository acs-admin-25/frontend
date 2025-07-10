import { Conversation } from '@/types/conversation';
import { DateRange } from '@/app/dashboard/components/tabs/DashboardTabs';
import { subDays, format, subHours } from 'date-fns';

// Generate chart data from real conversations
export function generateChartData(conversations: Conversation[], dateRange: DateRange = '30d') {
  let days: number;
  let dateFormat: string;
  let xAxisFormat: string;
  
  switch (dateRange) {
    case '24h':
      days = 24;
      dateFormat = 'HH:mm';
      xAxisFormat = 'HH:mm';
      break;
    case '7d':
      days = 7;
      dateFormat = 'MMM dd';
      xAxisFormat = 'dd';
      break;
    case '30d':
      days = 30;
      dateFormat = 'MMM dd';
      xAxisFormat = 'dd';
      break;
    case '3m':
      days = 90;
      dateFormat = 'MMM dd';
      xAxisFormat = 'MMM dd';
          break;
    case '6m':
      days = 180;
      dateFormat = 'MMM dd';
      xAxisFormat = 'MMM dd';
          break;
    case '1y':
      days = 365;
      dateFormat = 'MMM dd';
      xAxisFormat = 'MMM dd';
          break;
    default:
      days = 30;
      dateFormat = 'MMM dd';
      xAxisFormat = 'dd';
  }

  // Conversion Rate Trend
  const conversionRateData = Array(days).fill(0).map((_, i) => {
    const date = dateRange === '24h' 
      ? subHours(new Date(), days - 1 - i)
      : subDays(new Date(), days - 1 - i);
    
    const dayConversations = conversations.filter(conv => {
      const convDate = new Date(conv.thread.createdAt);
      if (dateRange === '24h') {
        return convDate.getTime() >= date.getTime() && 
               convDate.getTime() < new Date(date.getTime() + 60 * 60 * 1000).getTime();
      }
      return convDate.toDateString() === date.toDateString();
    });
    
    const total = dayConversations.length;
    const completed = dayConversations.filter(c => c.thread.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { 
      name: format(date, dateRange === '24h' ? 'HH:mm' : 'd'), 
      value: rate,
      date: format(date, dateFormat)
    };
  });

  // Active Leads Trend
  const activeLeadsData = Array(days).fill(0).map((_, i) => {
    const date = dateRange === '24h' 
      ? subHours(new Date(), days - 1 - i)
      : subDays(new Date(), days - 1 - i);
    
    const currentDayConversations = conversations.filter(conv => {
      const convDate = new Date(conv.thread.createdAt);
      if (dateRange === '24h') {
        return convDate.getTime() >= date.getTime() && 
               convDate.getTime() < new Date(date.getTime() + 60 * 60 * 1000).getTime();
      }
      return convDate.toDateString() === date.toDateString();
    });
    
    const previousDate = dateRange === '24h' 
      ? subHours(date, 1)
      : subDays(date, 1);
    
    const previousDayConversations = conversations.filter(conv => {
      const convDate = new Date(conv.thread.createdAt);
      if (dateRange === '24h') {
        return convDate.getTime() >= previousDate.getTime() && 
               convDate.getTime() < new Date(previousDate.getTime() + 60 * 60 * 1000).getTime();
      }
      return convDate.toDateString() === previousDate.toDateString();
    });
    
    return {
      name: format(date, dateRange === '24h' ? 'HH:mm' : 'd'),
      current: currentDayConversations.filter(c => !c.thread.completed).length,
      previous: previousDayConversations.filter(c => !c.thread.completed).length,
      date: format(date, dateFormat)
    };
  });

  // Total Leads Growth
  const totalLeadsData = Array(days).fill(0).map((_, i) => {
    const date = dateRange === '24h' 
      ? subHours(new Date(), days - 1 - i)
      : subDays(new Date(), days - 1 - i);
    
    const dayConversations = conversations.filter(conv => {
      const convDate = new Date(conv.thread.createdAt);
      if (dateRange === '24h') {
        return convDate.getTime() >= date.getTime() && 
               convDate.getTime() < new Date(date.getTime() + 60 * 60 * 1000).getTime();
      }
      return convDate.toDateString() === date.toDateString();
    });
    
    return { 
      name: format(date, dateRange === '24h' ? 'HH:mm' : 'd'), 
      value: dayConversations.length,
      date: format(date, dateFormat)
    };
  });

  // Average Response Time
  const avgResponseTimeData = Array(days).fill(0).map((_, i) => {
    const date = dateRange === '24h' 
      ? subHours(new Date(), days - 1 - i)
      : subDays(new Date(), days - 1 - i);
    
    const dayConversations = conversations.filter(conv => {
      const convDate = new Date(conv.thread.createdAt);
      if (dateRange === '24h') {
        return convDate.getTime() >= date.getTime() && 
               convDate.getTime() < new Date(date.getTime() + 60 * 60 * 1000).getTime();
      }
      return convDate.toDateString() === date.toDateString();
    });
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    dayConversations.forEach(conv => {
      const messages = conv.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      for (let j = 1; j < messages.length; j++) {
        const prevTime = new Date(messages[j - 1].timestamp).getTime();
        const currTime = new Date(messages[j].timestamp).getTime();
        const responseTime = currTime - prevTime;
        if (responseTime > 0 && responseTime < 24 * 60 * 60 * 1000) {
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });
    
    const avgTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / (1000 * 60)) : 0;
    
    return { 
      name: format(date, dateRange === '24h' ? 'HH:mm' : 'd'), 
      value: avgTime,
      date: format(date, dateFormat)
    };
  });

  // User Overview Data
  const userOverviewData = Array(days).fill(0).map((_, i) => {
    const date = dateRange === '24h' 
      ? subHours(new Date(), days - 1 - i)
      : subDays(new Date(), days - 1 - i);
    
    const dayConversations = conversations.filter(conv => {
      const convDate = new Date(conv.thread.createdAt);
      if (dateRange === '24h') {
        return convDate.getTime() >= date.getTime() && 
               convDate.getTime() < new Date(date.getTime() + 60 * 60 * 1000).getTime();
      }
      return convDate.toDateString() === date.toDateString();
    });
    
    return {
      date: format(date, dateFormat),
      users: dayConversations.length
    };
  });

  // Leads Funnel Data
  const sourceCounts: Record<string, number> = {};
  conversations.forEach(conv => {
    const source = conv.thread.source_name || 'Unknown';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  const colors = ['#22c55e', '#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];
  const leadsFunnelData = Object.entries(sourceCounts).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length]
  }));
  
  return {
    conversionRateData,
    activeLeadsData,
    totalLeadsData,
    avgResponseTimeData,
    userOverviewData,
    leadsFunnelData
  };
}

// Calculate real metrics from conversations
export function calculateRealMetrics(conversations: Conversation[]) {
  const totalConversations = conversations.length;
  const completedConversations = conversations.filter(conv => conv.thread.completed).length;
  const activeConversations = totalConversations - completedConversations;
  const conversionRate = totalConversations > 0 ? Math.round((completedConversations / totalConversations) * 100) : 0;

  // Calculate average response time
  let totalResponseTime = 0;
  let responseCount = 0;
  
  conversations.forEach(conv => {
    const messages = conv.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (let i = 1; i < messages.length; i++) {
      const prevTime = new Date(messages[i - 1].timestamp).getTime();
      const currTime = new Date(messages[i].timestamp).getTime();
      const responseTime = currTime - prevTime;
      if (responseTime > 0 && responseTime < 24 * 60 * 60 * 1000) {
        totalResponseTime += responseTime;
        responseCount++;
      }
    }
  });

  const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / (1000 * 60)) : 0;
  
  return {
    totalConversations,
    activeConversations,
    completedConversations,
    conversionRate,
    avgResponseTime
  };
}

// Calculate trends
export function calculateTrends(conversations: Conversation[], startDate: Date, endDate: Date) {
  const currentPeriodConversations = conversations.filter(conv => {
    const convDate = new Date(conv.thread.createdAt);
    return convDate >= startDate && convDate <= endDate;
  });

  const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
  const previousEndDate = startDate;

  const previousPeriodConversations = conversations.filter(conv => {
    const convDate = new Date(conv.thread.createdAt);
    return convDate >= previousStartDate && convDate < previousEndDate;
  });

  const currentMetrics = calculateRealMetrics(currentPeriodConversations);
  const previousMetrics = calculateRealMetrics(previousPeriodConversations);

  return {
    conversionRate: currentMetrics.conversionRate - previousMetrics.conversionRate,
    activeConversations: currentMetrics.activeConversations - previousMetrics.activeConversations,
    totalLeads: currentMetrics.totalConversations - previousMetrics.totalConversations,
    averageResponseTime: currentMetrics.avgResponseTime - previousMetrics.avgResponseTime
  };
}

// Format trend change
export function formatTrendChange(change: number): string {
  if (change > 0) {
    return `+${change}`;
  } else if (change < 0) {
    return `${change}`;
  }
  return '0';
}

// Get trend direction
export function getTrendDirection(change: number): 'up' | 'down' | 'stable' | null {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'stable';
} 