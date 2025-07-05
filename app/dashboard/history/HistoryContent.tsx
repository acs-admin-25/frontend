"use client"

import React from 'react';
import { Settings, RefreshCw, ArrowLeft } from 'lucide-react';
import { useHistory } from './useHistory';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { cn } from '@/lib/utils/utils';
import { DataTable } from '../components/cards/DataTable';
import { LeadsMetricCard, ConversionMetricCard, ResponseTimeMetricCard, GrowthMetricCard } from '../components/cards/MetricsCard';

export function HistoryContent() {
  const router = useRouter();
  const { conversations, metrics, loading, error, refetch, lastUpdated } = useHistory();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading history..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <Settings className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading History</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refetch}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
              "bg-gradient-to-r from-[#0a5a2f] to-[#157a42] text-white hover:from-[#0e6537] hover:to-[#157a42]",
              "focus:outline-none focus:ring-2 focus:ring-[#0e6537]/50 shadow-sm hover:shadow-md"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50" style={{ minHeight: '100vh', overflow: 'auto' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Conversation History</h1>
                  <p className="text-sm sm:text-base text-gray-600">View completed conversations and past interactions</p>
                  {lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {lastUpdated.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Metrics Grid */}
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0e6537] rounded-full"></div>
                History Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LeadsMetricCard 
                  value={metrics.totalConversations} 
                  trend={metrics.monthlyGrowth}
                  trendLabel="last month"
                />
                <ConversionMetricCard 
                  value={metrics.completionRate} 
                  trend={metrics.monthlyGrowth}
                  trendLabel="last month"
                />
                <ResponseTimeMetricCard 
                  value={metrics.averageDuration} 
                  trend={-5}
                  trendLabel="last week"
                />
                <GrowthMetricCard 
                  value={metrics.monthlyGrowth} 
                  trend={metrics.monthlyGrowth}
                  trendLabel="last month"
                />
              </div>
            </div>
          </section>

          {/* History Table */}
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0e6537] rounded-full"></div>
                Completed Conversations
              </h2>
              <DataTable
                conversations={conversations}
                loading={loading}
                error={error}
                onRefresh={refetch}
                title="Completed Conversations"
                emptyMessage="No completed conversations found"
                showFilters={true}
                showSearch={true}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 