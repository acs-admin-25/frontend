/**
 * File: components/features/conversations/ConversationMetricsDashboard.tsx
 * Purpose: Enhanced metrics dashboard for conversations page with EV scores and pending emails
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

import React from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Target,
  Zap,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { 
  processConversationsData,
  calculateConversationMetrics,
  type ProcessedConversation
} from '@/lib/api/conversations';
import type { Conversation } from '@/types/conversation';

interface ConversationMetricsDashboardProps {
  conversations: Conversation[];
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  className?: string;
}

function MetricCard({ title, value, trend, trendLabel, icon, color, className }: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      border: 'border-blue-200',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-500',
      border: 'border-green-200',
      trend: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-500',
      border: 'border-yellow-200',
      trend: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-500',
      border: 'border-red-200',
      trend: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-500',
      border: 'border-purple-200',
      trend: 'text-purple-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      icon: 'text-indigo-500',
      border: 'border-indigo-200',
      trend: 'text-indigo-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={cn(
      "bg-white rounded-lg border shadow-sm p-6 transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={cn("text-2xl font-bold mt-1", classes.text)}>{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className={cn("w-4 h-4 mr-1", classes.trend)} />
              ) : (
                <TrendingDown className={cn("w-4 h-4 mr-1", classes.trend)} />
              )}
              <span className={cn("text-sm font-medium", classes.trend)}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-sm text-gray-500 ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", classes.bg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ConversationMetricsDashboard({ conversations, className }: ConversationMetricsDashboardProps) {
  // Process conversations to get enhanced metrics
  const processedConversations = processConversationsData(conversations);
  const metrics = calculateConversationMetrics(processedConversations);

  // Calculate additional metrics
  const pendingEmails = processedConversations.filter(c => c.status === 'pending').length;
  const avgEVScore = metrics.averageEVScore;
  const responseTime = calculateAverageResponseTime(processedConversations);
  const conversionRate = calculateConversionRate(processedConversations);

  // Calculate trends (mock data for now - would come from historical data)
  const trends = {
    active: 12,
    pending: 3,
    evScore: 2.1,
    responseTime: -5,
    conversion: 5
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Conversation Metrics</h2>
          <p className="text-sm text-gray-600">Real-time performance indicators</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Conversations"
          value={metrics.active}
          trend={trends.active}
          trendLabel="last month"
          icon={<MessageSquare className="w-6 h-6" />}
          color="blue"
        />
        
        <MetricCard
          title="Pending Emails"
          value={pendingEmails}
          trend={trends.pending}
          trendLabel="last week"
          icon={<Mail className="w-6 h-6" />}
          color="yellow"
        />
        
        <MetricCard
          title="Average EV Score"
          value={avgEVScore.toFixed(1)}
          trend={trends.evScore}
          trendLabel="last week"
          icon={<Target className="w-6 h-6" />}
          color="green"
        />
        
        <MetricCard
          title="Response Time"
          value={`${responseTime}h`}
          trend={trends.responseTime}
          trendLabel="last week"
          icon={<Clock className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          trend={trends.conversion}
          trendLabel="last month"
          icon={<CheckCircle className="w-6 h-6" />}
          color="indigo"
        />
        
        <MetricCard
          title="Total Conversations"
          value={metrics.total}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        
        {/* <MetricCard
          title="High Priority"
          value={processedConversations.filter(c => c.thread.priority === 'high' || c.thread.priority === 'urgent').length}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
        /> */}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingEmails}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.flagged}</div>
            <div className="text-sm text-gray-600">Flagged</div>
          </div>
          {/* Spam card removed as requested */}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateAverageResponseTime(conversations: ProcessedConversation[]): number {
  // Mock calculation - would need actual response time data
  return 2.3;
}

function calculateConversionRate(conversations: ProcessedConversation[]): number {
  const completed = conversations.filter(c => c.status === 'completed').length;
  const total = conversations.length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}