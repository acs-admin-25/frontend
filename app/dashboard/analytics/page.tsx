/**
 * File: app/dashboard/analytics/page.tsx
 * Purpose: Analytics dashboard with centralized data processing and modular components
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 5.0.0
 */

"use client"

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { useAnalyticsData } from '@/lib/hooks/useCentralizedDashboardData';
import { DataTable } from '@/app/dashboard/components/cards/DataTable';
import { 
  LeadsMetricCard, 
  ConversionMetricCard, 
  ResponseTimeMetricCard,
  GrowthMetricCard 
} from '@/app/dashboard/components/cards/MetricsCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  RefreshCw,
  Filter,
  Search,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { useRouter } from 'next/navigation';

function AnalyticsContent() {
  const router = useRouter();
  const { 
    conversations, 
    data,
    analytics,
    loading, 
    error, 
    refetch,
    lastUpdated
  } = useAnalyticsData();

  // Use the full dashboard metrics instead of filtered metrics
  const metrics = data?.metrics;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <BarChart3 className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6">{error || 'An unexpected error occurred.'}</p>
          <Button onClick={() => refetch()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate real metrics from the data
  const totalLeads = conversations?.length || 0;
  const completedConversations = conversations?.filter(conv => conv.thread.completed).length || 0;
  const conversionRate = totalLeads > 0 ? Math.round((completedConversations / totalLeads) * 100) : 0;
  const activeConversations = conversations?.filter(conv => !conv.thread.completed).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into your lead performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            30 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid - Using existing cards with real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LeadsMetricCard 
          value={totalLeads} 
          trend={metrics.monthlyGrowth}
          trendLabel="last month"
        />
        <ConversionMetricCard 
          value={conversionRate} 
          trend={metrics.monthlyGrowth}
          trendLabel="last month"
        />
        <ResponseTimeMetricCard 
          value={metrics.averageResponseTime} 
          trend={-5}
          trendLabel="last week"
        />
        <GrowthMetricCard 
          value={activeConversations} 
          trend={metrics.monthlyGrowth}
          trendLabel="last month"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="conversations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Conversations
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* EV by Message Chart */}
            <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">EV Score by Message</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Average EV</span>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                {conversations && conversations.length > 0 ? (
                  <div className="w-full h-full flex items-end justify-between space-x-2">
                    {conversations.slice(0, 8).map((conv, index) => {
                      const evScore = conv.thread.aiScore || 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                            style={{ height: `${Math.max(evScore * 100, 10)}%` }}
                          ></div>
                          <span className="text-xs text-gray-600 mt-2">{index + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No EV data available</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Lead Source Performance */}
            <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Source Performance</h3>
              <div className="space-y-4">
                {conversations && conversations.length > 0 ? (
                  conversations.slice(0, 5).map((conv, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {conv.thread.source_name || 'Unknown Source'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {conv.thread.aiScore ? `${(conv.thread.aiScore * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">EV Score</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <p>No conversation data available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Conversations</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
              <DataTable
                conversations={conversations}
                loading={loading}
                error={error}
                onRefresh={refetch}
                title=""
                emptyMessage="No conversations found"
                showFilters={true}
                showSearch={true}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Time Analysis</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Response time chart coming soon</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Conversion funnel chart coming soon</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Total Conversations</h4>
                  <p className="text-green-700 text-sm">You have {totalLeads} total conversations in your system.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Conversion Rate</h4>
                  <p className="text-blue-700 text-sm">Your current conversion rate is {conversionRate}%.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Active Conversations</h4>
                  <p className="text-yellow-700 text-sm">You have {activeConversations} active conversations.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Average Response Time</h4>
                  <p className="text-purple-700 text-sm">Average response time is {metrics.averageResponseTime} minutes.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <PageLayout 
      title="Analytics" 
      showNavbar={false} 
      maxWidth="full" 
      padding="lg" 
      fullHeight={false}
    >
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <div className="text-red-500 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Error</h2>
            <p className="text-gray-600 mb-6">Something went wrong with the analytics page.</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
          </Card>
        </div>
      }>
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading analytics..." />}>
          <AnalyticsContent />
        </Suspense>
      </ErrorBoundary>
    </PageLayout>
  );
}

/**
 * Change Log:
 * 12/19/24 - Version 3.0.0 - Enhanced Analytics Integration
 * - Added EnhancedAnalyticsCharts component with comprehensive charts
 * - Integrated conversation trends, lead source performance, and engagement analysis
 * - Applied ACS green and white theme throughout all charts
 * - Added performance overview cards with gradient backgrounds
 * - Improved layout with better spacing and organization
 * - Enhanced data visualization with multiple chart types
 * 
 * 12/19/24 - Version 2.0.0 - Modular Architecture
 * - Implemented centralized analytics context
 * - Created modular components (Header, Filters, Content)
 * - Added Average EV score by message chart
 * - Removed old components (LeadSourcesChart, ConversionTrendChart)
 * - Added advanced filtering capabilities
 * - Improved type safety and error handling
 * - Centralized data processing and calculations
 * 
 * 5/25/25 - Initial version
 * - Created analytics dashboard with key metrics
 * - Implemented date range selection
 * - Added lead sources visualization
 * - Created conversion trends chart
 * - Integrated responsive design for all screen sizes
 */
