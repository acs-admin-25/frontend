/**
 * File: app/dashboard/usage/page.tsx
 * Purpose: Usage statistics and billing limits page with centralized data processing
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 3.0.0
 */

"use client"

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { useUsageData } from '@/lib/hooks/useCentralizedDashboardData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  RefreshCw,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Mail,
  Shield,
  TrendingUp
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { DataTable } from '../components/cards/DataTable';
import { EmailsSentMetricCard, TotalLoginsMetricCard, ActiveDaysMetricCard, EngagementRateMetricCard, AverageEmailsPerDayMetricCard, AccuracyRateMetricCard, FilteredTodayMetricCard, SpamDetectedMetricCard } from '../components/cards/MetricsCard';
import { UsageOverview } from '../components/cards/UsageOverview';

function UsageContent() {
  const router = useRouter();
  const { 
    conversations, 
    data,
    usage,
    usageStats,
    loading, 
    error, 
    refetch 
  } = useUsageData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading usage statistics..." />
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <BarChart3 className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Usage</h2>
          <p className="text-gray-600 mb-6">{error || 'An unexpected error occurred.'}</p>
          <Button onClick={() => refetch()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate billing and limits data
  const emailLimit = 1000; // Example limit
  const emailUsage = usage.emailsSent || 0;
  const emailUsagePercent = Math.min((emailUsage / emailLimit) * 100, 100);
  
  const loginLimit = 100; // Example limit
  const loginUsage = usage.logins || 0;
  const loginUsagePercent = Math.min((loginUsage / loginLimit) * 100, 100);

  const isNearLimit = (percent: number) => percent > 80;
  const isOverLimit = (percent: number) => percent > 100;

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
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Usage Overview Component */}
      <UsageOverview usage={usage} />

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EmailsSentMetricCard 
          value={usage.emailsSent} 
          trend={12.5}
          trendLabel="last month"
        />
        <TotalLoginsMetricCard 
          value={usage.logins} 
          trend={8.3}
          trendLabel="last month"
        />
        <ActiveDaysMetricCard 
          value={usage.activeDays} 
          trend={15.2}
          trendLabel="last month"
        />
        <EngagementRateMetricCard 
          value={usageStats?.engagementRate || 0} 
          trend={5.7}
          trendLabel="last month"
        />
      </div>

      {/* Billing Limits Section */}
      <Tabs defaultValue="limits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="limits" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Billing Limits
          </TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Usage Details
          </TabsTrigger>
          <TabsTrigger value="conversations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Conversations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Usage Limit */}
            <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Usage</h3>
                    <p className="text-sm text-gray-600">Monthly email sending limit</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isOverLimit(emailUsagePercent) 
                    ? 'bg-red-100 text-red-700' 
                    : isNearLimit(emailUsagePercent)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {isOverLimit(emailUsagePercent) && <AlertTriangle className="w-4 h-4" />}
                  {isNearLimit(emailUsagePercent) && <Clock className="w-4 h-4" />}
                  {!isNearLimit(emailUsagePercent) && <CheckCircle className="w-4 h-4" />}
                  <span>{emailUsagePercent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverLimit(emailUsagePercent) 
                        ? 'bg-red-500' 
                        : isNearLimit(emailUsagePercent)
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`} 
                    style={{ width: `${Math.min(emailUsagePercent, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used: {emailUsage.toLocaleString()}</span>
                  <span className="text-gray-600">Limit: {emailLimit.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Login Usage Limit */}
            <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Login Usage</h3>
                    <p className="text-sm text-gray-600">Monthly login limit</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isOverLimit(loginUsagePercent) 
                    ? 'bg-red-100 text-red-700' 
                    : isNearLimit(loginUsagePercent)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {isOverLimit(loginUsagePercent) && <AlertTriangle className="w-4 h-4" />}
                  {isNearLimit(loginUsagePercent) && <Clock className="w-4 h-4" />}
                  {!isNearLimit(loginUsagePercent) && <CheckCircle className="w-4 h-4" />}
                  <span>{loginUsagePercent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverLimit(loginUsagePercent) 
                        ? 'bg-red-500' 
                        : isNearLimit(loginUsagePercent)
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`} 
                    style={{ width: `${Math.min(loginUsagePercent, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used: {loginUsage.toLocaleString()}</span>
                  <span className="text-gray-600">Limit: {loginLimit.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Billing Summary */}
          <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Billing Summary</h3>
              </div>
              <Button variant="outline" size="sm">
                View Invoice
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">$29.99</p>
                <p className="text-sm text-gray-600">Monthly Plan</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">$0.00</p>
                <p className="text-sm text-gray-600">Overage Charges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">$29.99</p>
                <p className="text-sm text-gray-600">Total Due</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Additional Usage Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AverageEmailsPerDayMetricCard 
                value={usageStats?.averageEmailsPerDay || 0} 
                trend={3.2}
                trendLabel="last week"
              />
              <AccuracyRateMetricCard 
                value={95} 
                trend={2.1}
                trendLabel="last month"
              />
              <FilteredTodayMetricCard 
                value={12} 
                trend={-5.3}
                trendLabel="last week"
              />
              <SpamDetectedMetricCard 
                value={3} 
                trend={-12.5}
                trendLabel="last week"
              />
            </div>

            {/* Usage Insights */}
            <Card className="p-6 border-0 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Email Engagement</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">+12.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Spam Filtering</span>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">95% Accuracy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Response Time</span>
                  </div>
                  <span className="text-sm text-purple-600 font-medium">12m avg</span>
                </div>
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
                    Export
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
      </Tabs>
    </div>
  );
}

export default function UsagePage() {
  return (
    <PageLayout 
      title="Usage & Billing" 
      showNavbar={false} 
      maxWidth="full" 
      padding="lg" 
      fullHeight={true}
    >
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <div className="text-red-500 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Error</h2>
            <p className="text-gray-600 mb-6">Something went wrong with the usage page.</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
          </Card>
        </div>
      }>
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading usage statistics..." />}>
          <div className="overflow-y-auto flex-1">
            <UsageContent />
          </div>
        </Suspense>
      </ErrorBoundary>
    </PageLayout>
  );
} 