import { Conversation } from '@/types/conversation';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface ReportData {
  dateRange: string;
  generatedAt: string;
  summary: {
    totalConversations: number;
    activeConversations: number;
    completedConversations: number;
    conversionRate: number;
    averageResponseTime: number;
  };
  trends: {
    conversionRate: { current: number; previous: number; change: number };
    activeLeads: { current: number; previous: number; change: number };
    totalLeads: { current: number; previous: number; change: number };
  };
  topPerformers: Array<{
    leadName: string;
    conversationId: string;
    evScore: number;
    messageCount: number;
  }>;
  insights: string[];
}

export function generateDashboardReport(
  conversations: Conversation[],
  dateRange: string
): ReportData {
  const now = new Date();
  const currentPeriodStart = getDateRangeStart(dateRange);
  const previousPeriodStart = getPreviousPeriodStart(dateRange);
  
  // Filter conversations for current and previous periods
  const currentPeriodConversations = conversations.filter(conv => {
    const convDate = new Date(conv.thread.createdAt);
    return convDate >= currentPeriodStart && convDate <= now;
  });
  
  const previousPeriodConversations = conversations.filter(conv => {
    const convDate = new Date(conv.thread.createdAt);
    return convDate >= previousPeriodStart && convDate < currentPeriodStart;
  });

  // Calculate current period metrics
  const currentMetrics = calculatePeriodMetrics(currentPeriodConversations);
  const previousMetrics = calculatePeriodMetrics(previousPeriodConversations);

  // Calculate trends
  const trends = {
    conversionRate: {
      current: currentMetrics.conversionRate,
      previous: previousMetrics.conversionRate,
      change: currentMetrics.conversionRate - previousMetrics.conversionRate
    },
    activeLeads: {
      current: currentMetrics.activeConversations,
      previous: previousMetrics.activeConversations,
      change: currentMetrics.activeConversations - previousMetrics.activeConversations
    },
    totalLeads: {
      current: currentMetrics.totalConversations,
      previous: previousMetrics.totalConversations,
      change: currentMetrics.totalConversations - previousMetrics.totalConversations
    }
  };

  // Get top performers (conversations with highest EV scores)
  const topPerformers = currentPeriodConversations
    .map(conv => {
      const evMessage = conv.messages.find(msg => msg.ev_score !== undefined);
      return {
        leadName: conv.thread.lead_name || 'Unknown',
        conversationId: conv.thread.conversation_id,
        evScore: evMessage?.ev_score || 0,
        messageCount: conv.messages.length
      };
    })
    .filter(conv => conv.evScore > 0)
    .sort((a, b) => b.evScore - a.evScore)
    .slice(0, 5);

  // Generate insights
  const insights = generateInsights(currentMetrics, trends, topPerformers);

  return {
    dateRange,
    generatedAt: now.toISOString(),
    summary: currentMetrics,
    trends,
    topPerformers,
    insights
  };
}

function getDateRangeStart(dateRange: string): Date {
  const now = new Date();
  switch (dateRange) {
    case '24h':
      return subDays(now, 1);
    case '7d':
      return subDays(now, 7);
    case '30d':
      return subDays(now, 30);
    case '3m':
      return subDays(now, 90);
    case '6m':
      return subDays(now, 180);
    case '1y':
      return subDays(now, 365);
    default:
      return subDays(now, 30);
  }
}

function getPreviousPeriodStart(dateRange: string): Date {
  const currentStart = getDateRangeStart(dateRange);
  const duration = new Date().getTime() - currentStart.getTime();
  return new Date(currentStart.getTime() - duration);
}

function calculatePeriodMetrics(conversations: Conversation[]) {
  const totalConversations = conversations.length;
  const completedConversations = conversations.filter(conv => conv.thread.completed).length;
  const activeConversations = totalConversations - completedConversations;
  const conversionRate = totalConversations > 0 ? (completedConversations / totalConversations) * 100 : 0;

  // Calculate average response time
  let totalResponseTime = 0;
  let responseCount = 0;
  
  conversations.forEach(conv => {
    const messages = conv.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (let i = 1; i < messages.length; i++) {
      const prevTime = new Date(messages[i - 1].timestamp).getTime();
      const currTime = new Date(messages[i].timestamp).getTime();
      const responseTime = currTime - prevTime;
      if (responseTime > 0 && responseTime < 24 * 60 * 60 * 1000) { // Less than 24 hours
        totalResponseTime += responseTime;
        responseCount++;
      }
    }
  });

  const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount / (1000 * 60) : 0; // in minutes

  return {
    totalConversations,
    activeConversations,
    completedConversations,
    conversionRate,
    averageResponseTime
  };
}

function generateInsights(
  metrics: any,
  trends: any,
  topPerformers: any[]
): string[] {
  const insights: string[] = [];

  // Conversion rate insights
  if (metrics.conversionRate > 50) {
    insights.push('Excellent conversion rate! Your lead nurturing process is working effectively.');
  } else if (metrics.conversionRate > 30) {
    insights.push('Good conversion rate. Consider optimizing follow-up sequences to improve further.');
  } else {
    insights.push('Conversion rate has room for improvement. Focus on lead qualification and follow-up.');
  }

  // Trend insights
  if (trends.conversionRate.change > 5) {
    insights.push('Conversion rate is improving significantly compared to the previous period.');
  } else if (trends.conversionRate.change < -5) {
    insights.push('Conversion rate has declined. Review your lead nurturing strategies.');
  }

  if (trends.totalLeads.change > 0) {
    insights.push(`Lead generation is up by ${trends.totalLeads.change} compared to the previous period.`);
  }

  // Response time insights
  if (metrics.averageResponseTime < 30) {
    insights.push('Excellent response time! You\'re engaging leads quickly.');
  } else if (metrics.averageResponseTime > 120) {
    insights.push('Response time could be improved. Consider setting up automated responses.');
  }

  // Top performers insights
  if (topPerformers.length > 0) {
    const avgEvScore = topPerformers.reduce((sum, conv) => sum + conv.evScore, 0) / topPerformers.length;
    if (avgEvScore > 80) {
      insights.push('High engagement value scores indicate strong lead quality and effective communication.');
    }
  }

  return insights.slice(0, 5); // Limit to 5 insights
}

export function exportReportAsJSON(reportData: ReportData): string {
  return JSON.stringify(reportData, null, 2);
}

export function formatReportForDisplay(reportData: ReportData): string {
  const { summary, trends, topPerformers, insights } = reportData;
  
  let report = `Dashboard Report - ${reportData.dateRange}\n`;
  report += `Generated: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;
  
  report += `SUMMARY:\n`;
  report += `Total Conversations: ${summary.totalConversations}\n`;
  report += `Active Conversations: ${summary.activeConversations}\n`;
  report += `Completed Conversations: ${summary.completedConversations}\n`;
  report += `Conversion Rate: ${summary.conversionRate.toFixed(1)}%\n`;
  report += `Average Response Time: ${summary.averageResponseTime.toFixed(1)} minutes\n\n`;
  
  report += `TRENDS:\n`;
  report += `Conversion Rate Change: ${trends.conversionRate.change > 0 ? '+' : ''}${trends.conversionRate.change.toFixed(1)}%\n`;
  report += `Active Leads Change: ${trends.activeLeads.change > 0 ? '+' : ''}${trends.activeLeads.change}\n`;
  report += `Total Leads Change: ${trends.totalLeads.change > 0 ? '+' : ''}${trends.totalLeads.change}\n\n`;
  
  if (topPerformers.length > 0) {
    report += `TOP PERFORMERS:\n`;
    topPerformers.forEach((performer, index) => {
      report += `${index + 1}. ${performer.leadName} (EV: ${performer.evScore.toFixed(1)}, Messages: ${performer.messageCount})\n`;
    });
    report += '\n';
  }
  
  if (insights.length > 0) {
    report += `INSIGHTS:\n`;
    insights.forEach((insight, index) => {
      report += `${index + 1}. ${insight}\n`;
    });
  }
  
  return report;
} 