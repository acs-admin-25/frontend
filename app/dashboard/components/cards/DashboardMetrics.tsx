import React from 'react';
import { TrendingUp, TrendingDown, Users, MessageSquare, Target, Clock, DollarSign, Activity, Zap, Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import type { DashboardMetrics as Metrics } from '@/types/dashboard';
import { calculateTrends, shouldShowTrend, formatTrendChange, getTrendDirection, type TrendData } from '@/lib/utils/dashboard';

interface DashboardMetricsProps {
  data: Metrics;
  dateRange?: DateRange;
  conversations?: any[]; // Add conversations for trend calculation
}

const MetricCard = ({ 
  name, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  change, 
  changeType, 
  subtitle,
  trend,
  showTrend = true
}: { 
  name: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  change?: string; 
  changeType?: 'increase' | 'decrease';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable' | null;
  showTrend?: boolean;
}) => {
    const ChangeIcon = changeType === 'increase' ? TrendingUp : TrendingDown;
    const changeColor = changeType === 'increase' ? 'text-status-success' : 'text-status-error';
    const trendColor = trend === 'up' ? 'text-status-success' : trend === 'down' ? 'text-status-error' : 'text-muted-foreground';

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{name}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground/70">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-3xl font-bold text-card-foreground">{value}</p>
                {change && showTrend && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <ChangeIcon className={`h-4 w-4 mr-1 ${changeColor}`} />
                            <span>{change}</span>
                        </div>
                        {trend && (
                            <div className={`flex items-center text-xs ${trendColor}`}>
                                {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                                {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                                {trend === 'stable' && <Activity className="h-3 w-3 mr-1" />}
                                <span className="capitalize">{trend}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export function DashboardMetrics({ data, dateRange, conversations = [] }: DashboardMetricsProps) {
  // Calculate trends if we have date range and conversations
  const trends = dateRange && dateRange.from && dateRange.to && conversations.length > 0 
    ? calculateTrends(conversations, dateRange.from, dateRange.to)
    : null;

  // Calculate additional metrics
  const calculateResponseTimeCategory = (time: number) => {
    if (time <= 5) return { category: 'Excellent', color: 'text-status-success', bgColor: 'bg-status-success/10' };
    if (time <= 15) return { category: 'Good', color: 'text-status-info', bgColor: 'bg-status-info/10' };
    if (time <= 30) return { category: 'Fair', color: 'text-status-warning', bgColor: 'bg-status-warning/10' };
    return { category: 'Needs Improvement', color: 'text-status-error', bgColor: 'bg-status-error/10' };
  };

  const responseTimeCategory = calculateResponseTimeCategory(data.averageResponseTime);
  
  // Calculate conversation velocity (conversations per day)
  const conversationsPerDay = data.totalConversations > 0 ? 
    Math.round((data.totalConversations / 30) * 10) / 10 : 0;

  // Calculate engagement rate (active vs total)
  const engagementRate = data.totalConversations > 0 ? 
    Math.round((data.activeConversations / data.totalConversations) * 100) : 0;

  // Helper function to get trend data for a metric
  const getTrendData = (metricKey: 'totalConversations' | 'activeConversations' | 'conversionRate' | 'averageResponseTime' | 'newConversations') => {
    if (!trends) return { showTrend: false, change: '', trend: null as any };
    
    const trendData = trends[metricKey];
    const showTrend = shouldShowTrend(trendData);
    const change = showTrend ? formatTrendChange(trendData) : '';
    const trend = showTrend ? getTrendDirection(trendData) : null;
    
    return { showTrend, change, trend };
  };

  const totalConversationsTrend = getTrendData('totalConversations');
  const activeConversationsTrend = getTrendData('activeConversations');
  const conversionRateTrend = getTrendData('conversionRate');
  const responseTimeTrend = getTrendData('averageResponseTime');

  const metrics = [
    { 
      name: 'Total Conversations', 
      value: data.totalConversations, 
      icon: MessageSquare, 
      color: 'text-status-info', 
      bgColor: 'bg-status-info/10',
      subtitle: 'All time conversations',
      change: totalConversationsTrend.change,
      changeType: totalConversationsTrend.trend === 'up' ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: totalConversationsTrend.trend,
      showTrend: totalConversationsTrend.showTrend
    },
    { 
      name: 'Active Conversations', 
      value: data.activeConversations, 
      icon: Activity, 
      color: 'text-status-success', 
      bgColor: 'bg-status-success/10',
      subtitle: 'Currently in progress',
      change: activeConversationsTrend.change,
      changeType: activeConversationsTrend.trend === 'up' ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: activeConversationsTrend.trend,
      showTrend: activeConversationsTrend.showTrend
    },
    { 
      name: 'Conversion Rate', 
      value: `${data.conversionRate}%`, 
      icon: Target, 
      color: 'text-status-warning', 
      bgColor: 'bg-status-warning/10',
      subtitle: 'Successfully closed',
      change: conversionRateTrend.change || `${data.conversionRate >= 0 ? '+' : ''}${data.conversionRate}% vs target`,
      changeType: conversionRateTrend.trend === 'up' || data.conversionRate >= 15 ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: conversionRateTrend.trend || (data.conversionRate >= 15 ? 'up' : 'down' as 'up' | 'down'),
      showTrend: conversionRateTrend.showTrend
    },
    { 
      name: 'Avg Response Time', 
      value: `${data.averageResponseTime}m`, 
      icon: Clock, 
      color: responseTimeCategory.color, 
      bgColor: responseTimeCategory.bgColor,
      subtitle: responseTimeCategory.category,
      change: responseTimeTrend.change || (data.averageResponseTime <= 15 ? 'Under 15min target' : 'Above target'),
      changeType: responseTimeTrend.trend === 'down' || data.averageResponseTime <= 15 ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: responseTimeTrend.trend || (data.averageResponseTime <= 15 ? 'up' : 'down' as 'up' | 'down'),
      showTrend: responseTimeTrend.showTrend
    },
    { 
      name: 'Conversation Velocity', 
      value: `${conversationsPerDay}/day`, 
      icon: Zap, 
      color: 'text-secondary', 
      bgColor: 'bg-secondary/10',
      subtitle: 'Daily conversation rate',
      trend: conversationsPerDay > 1 ? 'up' : 'stable' as 'up' | 'stable',
      showTrend: false // No historical data for this metric yet
    },
    { 
      name: 'Engagement Rate', 
      value: `${engagementRate}%`, 
      icon: Users, 
      color: 'text-primary', 
      bgColor: 'bg-primary/10',
      subtitle: 'Active engagement level',
      change: `${engagementRate >= 0 ? '+' : ''}${engagementRate}% of total`,
      changeType: engagementRate >= 50 ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: engagementRate >= 50 ? 'up' : 'down' as 'up' | 'down',
      showTrend: false // No historical data for this metric yet
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.name} {...metric} />
        ))}
      </div>
      
      {/* Quick Stats Bar */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-success"></div>
              <span className="text-muted-foreground">Active: {data.activeConversations}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-warning"></div>
              <span className="text-muted-foreground">Pending: {data.totalConversations - data.activeConversations}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-success"></div>
              <span className="text-muted-foreground">Completed: {Math.round((data.conversionRate / 100) * data.totalConversations)}</span>
            </div>
          </div>
          <div className="text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            Last 30 days
          </div>
        </div>
      </div>
    </div>
  );
}