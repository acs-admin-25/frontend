/**
 * File: app/dashboard/conversations/page.tsx
 * Purpose: Enhanced conversations management page with compact layout and modal metrics
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 4.0.0
 */

"use client"

import React, { Suspense, useState } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { useConversationsData } from '@/lib/hooks/useCentralizedDashboardData';
import { 
  EnhancedConversationsTable,
  ConversationMetricsModal,
  CompactStatsSummary
} from '@/app/dashboard/conversations/conversations';
import { ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

function ConversationsContent() {
  const router = useRouter();
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  
  const { 
    conversations, 
    data,
    loading, 
    error, 
    refetch 
  } = useConversationsData({
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading conversations..." />
      </div>
    );
  }

  if (error || !conversations) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-status-error mb-4">Error Loading Conversations</h2>
          <p className="text-muted-foreground mb-4">{error || 'An unexpected error occurred.'}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header with Stats */}
      <div className="flex-shrink-0 p-6 bg-card w-full overflow-x-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 w-full">
          <div className="flex items-center space-x-4 w-full max-w-full overflow-x-auto">
            <button
              onClick={() => router.back()}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Conversations Management</h1>
              <p className="text-muted-foreground">Manage all conversations, filter pending emails, and track EV scores</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Removed the settings button from here */}
          </div>
        </div>

        <div className="mb-2 border-b border-border" />
        {/* Compact Stats Summary */}
        <div className="mt-8 w-full overflow-x-auto">
          <CompactStatsSummary 
            conversations={conversations}
            onShowMetrics={() => setShowMetricsModal(true)}
          />
        </div>
      </div>

      {/* Enhanced Conversations Table - Takes remaining height */}
      <div className="flex-1 min-h-0 p-4 pt-2 pb-0 w-full overflow-x-auto">
        <EnhancedConversationsTable
          conversations={conversations}
          loading={loading}
          error={error}
          onRefresh={refetch}
          className="h-full"
        />
      </div>

      {/* Metrics Modal */}
      <ConversationMetricsModal
        conversations={conversations}
        isOpen={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        modalId="conversations-metrics-modal"
      />
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <PageLayout 
      showNavbar={false}
      maxWidth="full"
      padding="none"
      fullHeight={true}
    >
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-status-error mb-4">Conversations Error</h2>
            <p className="text-muted-foreground mb-4">Something went wrong with the conversations page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <LoadingSpinner size="lg" text="Loading conversations..." />
          </div>
        }>
          <ConversationsContent />
        </Suspense>
      </ErrorBoundary>
    </PageLayout>
  );
}
