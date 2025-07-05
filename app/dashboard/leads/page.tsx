/**
 * File: app/dashboard/leads/page.tsx
 * Purpose: Leads management page with centralized data processing and modular components
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.0.0
 */

"use client"

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { useLeadsData } from '@/lib/hooks/useCentralizedDashboardData';
import { ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { DataTable } from '../components/cards/DataTable';
import { LeadsMetricCard, ConversionMetricCard, ResponseTimeMetricCard, GrowthMetricCard } from '../components/cards/MetricsCard';

function LeadsContent() {
  const router = useRouter();
  const { 
    conversations, 
    data,
    loading, 
    error, 
    refetch 
  } = useLeadsData();

  // Use the full dashboard metrics instead of filtered metrics
  const metrics = data?.metrics;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading leads..." />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Leads</h2>
          <p className="text-gray-600 mb-4">{error || 'An unexpected error occurred.'}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600">Manage and track your lead pipeline</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
        <LeadsMetricCard 
          value={metrics.totalLeads} 
          trend={metrics.monthlyGrowth}
          trendLabel="last month"
        />
        <ConversionMetricCard 
          value={metrics.conversionRate} 
          trend={metrics.monthlyGrowth}
          trendLabel="last month"
        />
        <ResponseTimeMetricCard 
          value={metrics.averageResponseTime} 
          trend={-5}
          trendLabel="last week"
        />
        <GrowthMetricCard 
          value={metrics.monthlyGrowth} 
          trend={metrics.monthlyGrowth}
          trendLabel="last month"
        />
      </div>

      {/* Leads Table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          conversations={conversations}
          loading={loading}
          error={error}
          onRefresh={refetch}
          title="All Leads"
          emptyMessage="No leads found"
          showFilters={true}
          showSearch={true}
        />
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <PageLayout 
      title="Leads" 
      showNavbar={false} 
      fullHeight={true}
      maxWidth="full"
      padding="lg"
    >
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Leads Error</h2>
            <p className="text-gray-600 mb-4">Something went wrong with the leads page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }>
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading leads..." />}>
          <LeadsContent />
        </Suspense>
      </ErrorBoundary>
    </PageLayout>
  );
}