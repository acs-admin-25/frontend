/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This component is exported but never imported or used in the application.
 * It appears to be legacy metric card functionality that was never integrated.
 * Note: There are other MetricCard components in different locations that are being used.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart3, Clock } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
}

const iconMap = {
  'Total Leads': Users,
  'Conversion Rate': DollarSign,
  'Avg. Response Time': Clock,
  'Active Leads': BarChart3,
};

export function MetricCard({ title, value, trend, trendDirection }: MetricCardProps) {
  const Icon = iconMap[title as keyof typeof iconMap] || BarChart3;
  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trendDirection === 'up' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        <span className={trendColor}>{trend}</span>
      </div>
    </div>
  );
} 