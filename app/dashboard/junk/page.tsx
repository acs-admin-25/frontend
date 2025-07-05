/**
 * File: app/dashboard/junk/page.tsx
 * Purpose: Junk/spam management page with centralized data processing and modular components
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.0.0
 */

"use client"

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { useJunk } from '@/lib/hooks/useJunk';
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { DataTable } from '../components/cards/DataTable';
import { SpamDetectedMetricCard, FilteredTodayMetricCard, AccuracyRateMetricCard, LeadsMetricCard } from '../components/cards/MetricsCard';

function JunkContent() {
  const router = useRouter();
  const { 
    conversations, 
    metrics,
    stats,
    loading, 
    error, 
    refetch 
  } = useJunk();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading junk/spam..." />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Junk/Spam</h2>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Spam Detection Active</h3>
            <p className="text-sm text-yellow-700">
              These conversations have been flagged as potential spam. Review them carefully before taking action.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpamDetectedMetricCard 
          value={metrics.totalSpamDetected} 
          trend={metrics.spamTrends.monthly}
          trendLabel="last month"
        />
        <FilteredTodayMetricCard 
          value={metrics.spamTrends.daily} 
          trend={metrics.spamTrends.weekly}
          trendLabel="last week"
        />
        <AccuracyRateMetricCard 
          value={metrics.accuracyRate} 
          trend={stats?.detectionAccuracy || 0}
          trendLabel="detection rate"
        />
        <LeadsMetricCard 
          value={stats?.totalConversations || 0} 
          trend={metrics.recentActivity.flagged}
          trendLabel="flagged today"
        />
      </div>

      {/* Spam Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-0 bg-gradient-to-br from-white to-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spam Detection Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Spam Detected</span>
              <span className="font-semibold">{metrics.totalSpamDetected}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">False Positives</span>
              <span className="font-semibold text-green-600">{metrics.falsePositives}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Detection Rate</span>
              <span className="font-semibold">{metrics.detectionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Accuracy Rate</span>
              <span className="font-semibold">{metrics.accuracyRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-0 bg-gradient-to-br from-white to-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spam by Type</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Generic Messages</span>
              <span className="font-semibold">{metrics.spamByType.genericMessages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Suspicious Links</span>
              <span className="font-semibold">{metrics.spamByType.suspiciousLinks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bot-like Behavior</span>
              <span className="font-semibold">{metrics.spamByType.botBehavior}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other</span>
              <span className="font-semibold">{metrics.spamByType.other}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-0 bg-gradient-to-br from-white to-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.recentActivity.flagged}</div>
            <div className="text-sm text-gray-600">Flagged</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{metrics.recentActivity.reviewed}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{metrics.recentActivity.restored}</div>
            <div className="text-sm text-gray-600">Restored</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{metrics.recentActivity.deleted}</div>
            <div className="text-sm text-gray-600">Deleted</div>
          </div>
        </div>
      </div>

      {/* Junk/Spam Table */}
      <DataTable
        conversations={conversations}
        loading={loading}
        error={error}
        onRefresh={refetch}
        title="Flagged as Spam"
        emptyMessage="No spam detected"
        showFilters={true}
        showSearch={true}
      />
    </div>
  );
}

export default function JunkPage() {
  return (
    <PageLayout 
      title="Junk & Spam Management" 
      showNavbar={false} 
      maxWidth="full" 
      padding="lg" 
      fullHeight={true}
    >
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Junk/Spam Error</h2>
            <p className="text-gray-600 mb-4">Something went wrong with the junk/spam page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }>
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading junk/spam..." />}>
          <div className="overflow-y-auto flex-1">
            <JunkContent />
          </div>
        </Suspense>
      </ErrorBoundary>
    </PageLayout>
  );
} 