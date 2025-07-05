/**
 * File: components/features/dashboard/MetricsCard.tsx
 * Purpose: Modular metrics card component for displaying key metrics across dashboard sections
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.0.0
 */

import React from 'react';
import { cn } from '@/lib/utils/utils';
import { formatCurrency, formatPercentage, formatDuration } from '@/lib/utils/dashboard';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  DollarSign,
  BarChart3,
  CheckCircle,
  Mail,
  Calendar,
  AlertTriangle,
  Shield,
  Check,
  LogIn
} from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'orange';
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'text';
  className?: string;
  onClick?: () => void;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-500',
    border: 'border-green-200',
    hover: 'hover:bg-green-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    icon: 'text-yellow-500',
    border: 'border-yellow-200',
    hover: 'hover:bg-yellow-100'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'text-red-500',
    border: 'border-red-200',
    hover: 'hover:bg-red-100'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100'
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    icon: 'text-indigo-500',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-100'
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-100'
  }
};

const defaultIcons = {
  'Total Leads': Users,
  'Active Conversations': MessageSquare,
  'Conversion Rate': CheckCircle,
  'Response Time': Clock,
  'Revenue': DollarSign,
  'Growth': BarChart3,
};

export function MetricsCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color = 'blue',
  format = 'number',
  className,
  onClick
}: MetricsCardProps) {
  const colors = colorVariants[color];
  const DefaultIcon = Icon || defaultIcons[title as keyof typeof defaultIcons] || BarChart3;

  const formatValue = (val: string | number) => {
    // Handle unexpected types
    if (val === null || val === undefined) return '0';
    if (typeof val === 'object') {
      return '0';
    }
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'duration':
        return formatDuration(val);
      case 'text':
        return val.toString();
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border p-6 transition-all duration-200",
        colors.border,
        onClick && "cursor-pointer",
        onClick && colors.hover,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <DefaultIcon className={cn("w-5 h-5", colors.icon)} />
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>
          {trend !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-sm text-gray-500">vs {trendLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized metric cards for common dashboard metrics
export function LeadsMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Total Leads"
      value={value}
      trend={trend}
      color="blue"
      icon={Users}
      {...props}
    />
  );
}

export function ConversationsMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Active Conversations"
      value={value}
      trend={trend}
      color="green"
      icon={MessageSquare}
      {...props}
    />
  );
}

export function ConversionMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Conversion Rate"
      value={value}
      trend={trend}
      color="purple"
      icon={CheckCircle}
      format="percentage"
      {...props}
    />
  );
}

export function ResponseTimeMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Avg Response Time"
      value={value}
      trend={trend}
      color="yellow"
      icon={Clock}
      format="duration"
      {...props}
    />
  );
}

export function RevenueMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Total Revenue"
      value={value}
      trend={trend}
      color="green"
      icon={DollarSign}
      format="currency"
      {...props}
    />
  );
}

export function GrowthMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Monthly Growth"
      value={value}
      trend={trend}
      color="indigo"
      icon={BarChart3}
      format="percentage"
      {...props}
    />
  );
}

export function EmailsSentMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Emails Sent"
      value={value}
      trend={trend}
      color="blue"
      icon={Mail}
      {...props}
    />
  );
}

export function ActiveDaysMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Active Days"
      value={value}
      trend={trend}
      color="purple"
      icon={Calendar}
      {...props}
    />
  );
}

export function EngagementRateMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Engagement Rate"
      value={value}
      trend={trend}
      color="green"
      icon={Users}
      format="percentage"
      {...props}
    />
  );
}

export function SpamDetectedMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Spam Detected"
      value={value}
      trend={trend}
      color="red"
      icon={AlertTriangle}
      {...props}
    />
  );
}

export function FilteredTodayMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Filtered Today"
      value={value}
      trend={trend}
      color="green"
      icon={Shield}
      {...props}
    />
  );
}

export function AccuracyRateMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Accuracy Rate"
      value={value}
      trend={trend}
      color="blue"
      icon={Check}
      format="percentage"
      {...props}
    />
  );
}

export function TotalLoginsMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Total Logins"
      value={value}
      trend={trend}
      color="green"
      icon={LogIn}
      {...props}
    />
  );
}

export function AverageEmailsPerDayMetricCard({ value, trend, ...props }: Omit<MetricsCardProps, 'title' | 'icon' | 'color'>) {
  return (
    <MetricsCard
      title="Avg Emails/Day"
      value={value}
      trend={trend}
      color="orange"
      icon={Mail}
      {...props}
    />
  );
} 