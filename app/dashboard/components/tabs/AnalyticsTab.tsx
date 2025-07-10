"use client"

import React from 'react';
import { useCentralizedDashboardData } from '@/lib/hooks/useCentralizedDashboardData';
import { AnalyticsMetrics } from '../AnalyticsMetrics';
import { UserGraphCard } from '../UserGraphCard';
import { LeadsJourneyFunnel } from '../LeadsJourneyFunnel';
import type { DateRange } from './DashboardTabs';

interface AnalyticsTabProps {
  selectedDateRange: DateRange;
}

export function AnalyticsTab({ selectedDateRange }: AnalyticsTabProps) {
  const { data, loading, error } = useCentralizedDashboardData();
  
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error || 'An unexpected error occurred.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const conversations = data.conversations || [];

  return (
    <div id="analytics-dashboard-content" className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full space-y-6">
        {/* Analytics Dashboard Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last {selectedDateRange === '24h' ? '24 Hours' : 
                  selectedDateRange === '7d' ? '7 Days' : 
                  selectedDateRange === '30d' ? '30 Days' : 
                  selectedDateRange === '3m' ? '3 Months' : 
                  selectedDateRange === '6m' ? '6 Months' : '1 Year'}
          </div>
        </div>

        {/* Top Row Metric Cards */}
        <AnalyticsMetrics 
          conversations={conversations} 
          selectedDateRange={selectedDateRange} 
        />

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Overview - Takes 2 columns */}
          <UserGraphCard 
            conversations={conversations} 
            selectedDateRange={selectedDateRange} 
          />

          {/* Leads Journey Funnel */}
          <LeadsJourneyFunnel 
            conversations={conversations} 
            selectedDateRange={selectedDateRange} 
          />
        </div>
      </div>
    </div>
  );
} 