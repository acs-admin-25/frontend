/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This component is exported but never imported or used in the application.
 * It appears to be legacy analytics header functionality that was never integrated.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

'use client';

import React from 'react';
import { BarChart3, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useAnalytics } from './AnalyticsContext';

interface AnalyticsHeaderProps {
  className?: string;
  title?: string;
  description?: string;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export function AnalyticsHeader({ 
  className,
  title = "Analytics Dashboard",
  description = "Key metrics and performance data for your business.",
  showRefreshButton = true,
  onRefresh
}: AnalyticsHeaderProps) {
  const { state, refreshData } = useAnalytics();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refreshData();
    }
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className={cn("flex-shrink-0 p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
          </div>
          
          {state.data?.lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatLastUpdated(state.data.lastUpdated)}</span>
            </div>
          )}
        </div>

        {showRefreshButton && (
          <button
            onClick={handleRefresh}
            disabled={state.loading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              state.loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <RefreshCw className={cn("h-4 w-4", state.loading && "animate-spin")} />
            {state.loading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Data Summary */}
      {state.data && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Date Range:</span>
              <span className="ml-2 font-medium">
                {state.filters.dateRange === '7d' ? '7 Days' : 
                 state.filters.dateRange === '30d' ? '30 Days' : 
                 state.filters.dateRange === '90d' ? '90 Days' : 'Custom Range'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Metrics:</span>
              <span className="ml-2 font-medium">{state.data.keyMetrics.length}</span>
            </div>
            <div>
              <span className="text-gray-500">EV Data Points:</span>
              <span className="ml-2 font-medium">{state.data.evByMessage.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium">
                {state.loading ? 'Loading...' : state.error ? 'Error' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 