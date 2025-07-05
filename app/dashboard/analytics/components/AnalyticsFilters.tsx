/**
 * ⚠️  DEAD CODE - NOT USED ANYWHERE  ⚠️
 * 
 * This component is exported but never imported or used in the application.
 * It appears to be legacy analytics filtering functionality that was never integrated.
 * 
 * TODO: Remove this file if no longer needed
 * 
 * Last checked: 2025-01-XX
 * Status: Safe to delete
 */

'use client';

import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useAnalytics } from './AnalyticsContext';
import type { AnalyticsFilters } from '@/types/analytics';

interface AnalyticsFiltersProps {
  className?: string;
  showResetButton?: boolean;
}

export function AnalyticsFilters({ className, showResetButton = true }: AnalyticsFiltersProps) {
  const { state, dispatch } = useAnalytics();

  const handleDateRangeChange = (dateRange: AnalyticsFilters['dateRange']) => {
    dispatch({ type: 'SET_FILTERS', payload: { dateRange } });
  };

  const handleStatusChange = (conversationStatus: AnalyticsFilters['conversationStatus']) => {
    dispatch({ type: 'SET_FILTERS', payload: { conversationStatus } });
  };

  const handleLeadSourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const leadSource = event.target.value;
    dispatch({ type: 'SET_FILTERS', payload: { leadSource } });
  };

  const handleCustomDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    dispatch({ type: 'SET_FILTERS', payload: { [name]: value } });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  return (
    <div className={cn("bg-white p-4 rounded-lg border border-gray-200 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">Analytics Filters</h3>
        </div>
        {showResetButton && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  state.filters.dateRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {range === '7d' && '7D'}
                {range === '30d' && '30D'}
                {range === '90d' && '90D'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={state.filters.conversationStatus}
            onChange={(e) => handleStatusChange(e.target.value as AnalyticsFilters['conversationStatus'])}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Conversations</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Lead Source Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Lead Source
          </label>
          <select
            value={state.filters.leadSource}
            onChange={handleLeadSourceChange}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="social">Social Media</option>
            <option value="referral">Referral</option>
            <option value="email">Email</option>
          </select>
        </div>

        {/* Custom Date Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Custom Range
          </label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={state.filters.startDate || ''}
              onChange={handleCustomDateChange}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start date"
            />
          </div>
        </div>
      </div>

      {/* Custom End Date */}
      {state.filters.startDate && (
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="date"
              name="endDate"
              value={state.filters.endDate || ''}
              onChange={handleCustomDateChange}
              min={state.filters.startDate}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End date"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {state.filters.dateRange !== '30d' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {state.filters.dateRange === '7d' ? '7 Days' : 
               state.filters.dateRange === '90d' ? '90 Days' : 'Custom Range'}
            </span>
          )}
          {state.filters.conversationStatus && state.filters.conversationStatus !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              {state.filters.conversationStatus.charAt(0).toUpperCase() + 
               state.filters.conversationStatus.slice(1)}
            </span>
          )}
          {state.filters.leadSource && state.filters.leadSource !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              {state.filters.leadSource.charAt(0).toUpperCase() + 
               state.filters.leadSource.slice(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 