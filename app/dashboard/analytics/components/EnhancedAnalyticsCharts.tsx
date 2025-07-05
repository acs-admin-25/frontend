/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This component is exported but never imported or used in the application.
 * It appears to be enhanced analytics charts functionality that was never integrated.
 * Comment in analytics page mentions it was added but not actually used.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock,
  Target,
  DollarSign,
  Activity,
  Filter,
  Download,
  Eye,
  BarChart3,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import type { DashboardAnalytics, Conversation } from '@/types/dashboard';

// ACS Brand Colors
const ACS_COLORS = {
  primary: '#0e6537',
  secondary: '#157a42',
  accent: '#2a5f4f',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  light: '#f0fdf4',
  dark: '#064e3b',
  gradient: {
    from: '#0e6537',
    to: '#157a42',
    via: '#2a5f4f'
  }
};

const CHART_COLORS = [
  ACS_COLORS.primary,
  ACS_COLORS.secondary,
  ACS_COLORS.accent,
  ACS_COLORS.success,
  ACS_COLORS.warning,
  ACS_COLORS.info
];

interface EnhancedAnalyticsChartsProps {
  data: DashboardAnalytics;
  conversations: Conversation[];
  className?: string;
}

export function EnhancedAnalyticsCharts({ data, conversations, className }: EnhancedAnalyticsChartsProps) {
  // Calculate enhanced metrics
  const calculateEnhancedMetrics = () => {
    const totalConversations = conversations.length;
    const activeConversations = conversations.filter(c => !c.thread.completed).length;
    const completedConversations = conversations.filter(c => c.thread.completed).length;
    
    // Response time analysis
    const responseTimes = conversations
      .flatMap(c => c.messages)
      .filter(m => m.type === 'outbound-email')
      .map(m => new Date(m.timestamp).getTime() - new Date(m.localDate).getTime())
      .filter(time => time > 0);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000 / 60 // in minutes
      : 0;

    // Lead source effectiveness with conversion rates
    const sourceStats = conversations.reduce((acc, conv) => {
      const source = conv.thread.source_name || 'Unknown';
      if (!acc[source]) {
        acc[source] = { total: 0, completed: 0, avgResponseTime: 0, totalResponseTime: 0, responseCount: 0 };
      }
      acc[source].total++;
      if (conv.thread.completed) acc[source].completed++;
      
      // Calculate source-specific response times
      const convResponseTimes = conv.messages
        .filter(m => m.type === 'outbound-email')
        .map(m => new Date(m.timestamp).getTime() - new Date(m.localDate).getTime())
        .filter(time => time > 0);
      
      if (convResponseTimes.length > 0) {
        acc[source].totalResponseTime += convResponseTimes.reduce((a, b) => a + b, 0);
        acc[source].responseCount += convResponseTimes.length;
      }
      
      return acc;
    }, {} as Record<string, { total: number; completed: number; avgResponseTime: number; totalResponseTime: number; responseCount: number }>);

    // Calculate average response times per source
    Object.keys(sourceStats).forEach(source => {
      if (sourceStats[source].responseCount > 0) {
        sourceStats[source].avgResponseTime = sourceStats[source].totalResponseTime / sourceStats[source].responseCount / 1000 / 60;
      }
    });

    const sourceEffectiveness = Object.entries(sourceStats).map(([source, stats]) => ({
      source,
      total: stats.total,
      completed: stats.completed,
      conversionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      avgResponseTime: Math.round(stats.avgResponseTime)
    }));

    // Engagement metrics
    const engagementData = conversations.map(conv => ({
      id: conv.thread.conversation_id,
      messageCount: conv.messages.length,
      duration: conv.thread.completed 
        ? (new Date(conv.thread.updatedAt).getTime() - new Date(conv.thread.createdAt).getTime()) / (1000 * 60 * 60 * 24) // days
        : 0,
      completed: conv.thread.completed ? 1 : 0,
      leadName: conv.thread.lead_name || 'Unknown',
      source: conv.thread.source_name || 'Unknown'
    }));

    return {
      totalConversations,
      activeConversations,
      completedConversations,
      avgResponseTime: Math.round(avgResponseTime),
      sourceEffectiveness,
      engagementData,
      conversionRate: totalConversations > 0 ? (completedConversations / totalConversations) * 100 : 0
    };
  };

  const metrics = calculateEnhancedMetrics();

  // Conversation trend data
  const getConversationTrendData = () => {
    const days = 30; // Show last 30 days
    const trendData: Array<{
      date: string;
      conversations: number;
      completed: number;
      active: number;
      responseTime: number;
      responseCount: number;
      avgResponseTime: number;
    }> = Array(days).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        conversations: 0,
        completed: 0,
        active: 0,
        responseTime: 0,
        responseCount: 0,
        avgResponseTime: 0
      };
    });

    // Populate with actual data
    conversations.forEach(conv => {
      const convDate = new Date(conv.thread.createdAt).toISOString().split('T')[0];
      const dayIndex = trendData.findIndex(day => day.date === convDate);
      if (dayIndex !== -1) {
        trendData[dayIndex].conversations++;
        if (conv.thread.completed) {
          trendData[dayIndex].completed++;
        } else {
          trendData[dayIndex].active++;
        }
      }
    });

    return trendData;
  };

  const trendData = getConversationTrendData();

  const ChartCard = ({ title, children, className, actions }: { 
    title: string; 
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
  }) => (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="h-80">
        {children}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#0e6537] to-[#157a42] text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Conversations</p>
              <p className="text-2xl font-bold">{metrics.totalConversations}</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Conversion Rate</p>
              <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
            <Target className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Conversations</p>
              <p className="text-2xl font-bold">{metrics.activeConversations}</p>
            </div>
            <Activity className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg Response Time</p>
              <p className="text-2xl font-bold">{metrics.avgResponseTime}m</p>
            </div>
            <Clock className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversation Trend */}
        <ChartCard title="Conversation Trends (Last 30 Days)">
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke={ACS_COLORS.primary} 
                strokeWidth={3} 
                activeDot={{ r: 8, fill: ACS_COLORS.primary }}
                name="Total Conversations"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke={ACS_COLORS.success} 
                strokeWidth={2} 
                activeDot={{ r: 6, fill: ACS_COLORS.success }}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Lead Source Performance */}
        <ChartCard title="Lead Source Performance">
          <ResponsiveContainer>
            <BarChart data={metrics.sourceEffectiveness} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="source" type="category" stroke="#666" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name === 'conversionRate' ? `${value.toFixed(1)}%` : value,
                  name === 'conversionRate' ? 'Conversion Rate' : name === 'avgResponseTime' ? 'Avg Response (min)' : 'Total'
                ]}
              />
              <Legend />
              <Bar dataKey="conversionRate" fill={ACS_COLORS.secondary} name="Conversion Rate" />
              <Bar dataKey="avgResponseTime" fill={ACS_COLORS.warning} name="Avg Response Time" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Lead Engagement Analysis */}
        <ChartCard title="Lead Engagement Analysis">
          <ResponsiveContainer>
            <BarChart data={metrics.engagementData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="leadName" stroke="#666" tick={false} />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="messageCount" fill={ACS_COLORS.accent} name="Messages" />
              <Bar dataKey="duration" fill={ACS_COLORS.info} name="Duration (days)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Conversation Status Overview */}
        <ChartCard title="Conversation Status Overview">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[
                  { name: 'Active', value: metrics.activeConversations, color: ACS_COLORS.info },
                  { name: 'Completed', value: metrics.completedConversations, color: ACS_COLORS.success },
                  { name: 'Pending', value: Math.max(0, metrics.totalConversations - metrics.activeConversations - metrics.completedConversations), color: ACS_COLORS.warning }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[
                  { name: 'Active', value: metrics.activeConversations, color: ACS_COLORS.info },
                  { name: 'Completed', value: metrics.completedConversations, color: ACS_COLORS.success },
                  { name: 'Pending', value: Math.max(0, metrics.totalConversations - metrics.activeConversations - metrics.completedConversations), color: ACS_COLORS.warning }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
} 