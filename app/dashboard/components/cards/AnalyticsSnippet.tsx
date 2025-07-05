'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface AnalyticsSnippetProps {
  data: {
    totalLeads: number;
    conversionRate: number;
    activeConversations: number;
    avgResponseTime: number;
  };
  className?: string;
}

const iconMap = {
  'Total Leads': Users,
  'Conversion Rate': DollarSign,
  'Active Leads': BarChart3,
  'Avg. Response Time': Clock,
};

export function AnalyticsSnippet({ data, className }: AnalyticsSnippetProps) {
  const metrics = [
    {
      title: 'Total Leads',
      value: data.totalLeads,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+12%',
      trendDirection: 'up' as const
    },
    {
      title: 'Conversion Rate',
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-status-success',
      bgColor: 'bg-status-success/10',
      trend: '+5.2%',
      trendDirection: 'up' as const
    },
    {
      title: 'Active Leads',
      value: data.activeConversations,
      icon: BarChart3,
      color: 'text-status-info',
      bgColor: 'bg-status-info/10',
      trend: '+8%',
      trendDirection: 'up' as const
    },
    {
      title: 'Avg. Response Time',
      value: `${data.avgResponseTime}min`,
      icon: Clock,
      color: 'text-status-warning',
      bgColor: 'bg-status-warning/10',
      trend: '-15%',
      trendDirection: 'down' as const
    }
  ];

  return (
    <div className={cn("bg-card rounded-lg border border-border shadow-sm p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Analytics Overview</h3>
          <p className="text-sm text-muted-foreground">Key performance metrics at a glance</p>
        </div>
        <Link 
          href="/dashboard/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-secondary-dark text-secondary-foreground rounded-lg hover:from-secondary-dark hover:to-secondary transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="text-sm font-medium">View Full Analytics</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trendDirection === 'up' ? TrendingUp : TrendingDown;
          const trendColor = metric.trendDirection === 'up' ? 'text-status-success' : 'text-status-error';

          return (
            <div key={index} className="bg-muted rounded-lg p-4 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", metric.bgColor)}>
                  <Icon className={cn("w-5 h-5", metric.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium">{metric.title}</p>
                  <p className="text-lg font-bold text-card-foreground">{metric.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon className={cn("w-3 h-3", trendColor)} />
                <span className={cn("text-xs font-medium", trendColor)}>{metric.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-status-success rounded-full"></div>
            <span className="text-status-success font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
} 