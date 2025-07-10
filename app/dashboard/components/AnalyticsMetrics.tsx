import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, YAxis, XAxis } from 'recharts';
import { Conversation } from '@/types/conversation';
import { DateRange } from '../tabs/DashboardTabs';
import { calculateRealMetrics, generateChartData, calculateTrends, formatTrendChange, getTrendDirection } from '@/lib/utils/analytics';
import { subDays } from 'date-fns';

interface AnalyticsMetricsProps {
  conversations: Conversation[];
  selectedDateRange: DateRange;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "stable";
  chart: React.ReactNode;
}

function MetricCard({ title, value, change, changeType, chart }: MetricCardProps) {
  const getChangeColor = (type: "increase" | "decrease" | "stable") => {
    switch (type) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = (type: "increase" | "decrease" | "stable") => {
    switch (type) {
      case "increase":
        return "↗";
      case "decrease":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`text-sm font-medium ${getChangeColor(changeType)}`}>
          {getChangeIcon(changeType)} {change}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-4">{value}</div>
      <div className="h-16">
        {chart}
      </div>
    </div>
  );
}

export function AnalyticsMetrics({ conversations, selectedDateRange }: AnalyticsMetricsProps) {
  const metrics = calculateRealMetrics(conversations);
  const chartData = generateChartData(conversations, selectedDateRange);

  // Calculate trend changes
  const trends = calculateTrends(conversations, subDays(new Date(), 30), new Date());
  
  const conversionRateChange = formatTrendChange(trends.conversionRate);
  const activeLeadsChange = formatTrendChange(trends.activeConversations);
  const totalLeadsChange = formatTrendChange(trends.totalLeads);
  const responseTimeChange = formatTrendChange(trends.averageResponseTime);

  // Convert trend direction to MetricCard format
  const convertTrendDirection = (direction: 'up' | 'down' | 'stable' | null): 'increase' | 'decrease' | 'stable' => {
    if (direction === 'up') return 'increase';
    if (direction === 'down') return 'decrease';
    return 'stable';
  };

  const conversionRateDirection = convertTrendDirection(getTrendDirection(trends.conversionRate));
  const activeLeadsDirection = convertTrendDirection(getTrendDirection(trends.activeConversations));
  const totalLeadsDirection = convertTrendDirection(getTrendDirection(trends.totalLeads));
  const responseTimeDirection = convertTrendDirection(getTrendDirection(trends.averageResponseTime));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Conversion Rate"
        value={`${metrics.conversionRate}%`}
        change={conversionRateChange}
        changeType={conversionRateDirection || "stable"}
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.conversionRateData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <YAxis hide domain={[0, 'dataMax + 10']} />
              <XAxis 
                dataKey="name" 
                hide 
                tickFormatter={(value) => {
                  if (selectedDateRange === '24h') return value;
                  return value;
                }}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        }
      />
      <MetricCard
        title="Active Leads"
        value={metrics.activeConversations.toString()}
        change={activeLeadsChange}
        changeType={activeLeadsDirection || "stable"}
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.activeLeadsData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <YAxis hide domain={[0, 'dataMax + 2']} />
              <Line type="monotone" dataKey="current" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="previous" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        }
      />
      <MetricCard
        title="Total Leads"
        value={metrics.totalConversations.toString()}
        change={totalLeadsChange}
        changeType={totalLeadsDirection || "stable"}
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.totalLeadsData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <YAxis hide domain={[0, 'dataMax + 2']} />
              <Bar dataKey="value" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        }
      />
      <MetricCard
        title="Avg.Response Time"
        value={`${metrics.avgResponseTime}min`}
        change={responseTimeChange}
        changeType={responseTimeDirection || "stable"}
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.avgResponseTimeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <YAxis hide domain={[0, 'dataMax + 10']} />
              <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        }
      />
    </div>
  );
} 