/**
 * File: app/dashboard/page.tsx
 * Purpose: Main dashboard with centralized data processing and modular components
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.0.0
 */

"use client"

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { DashboardContent } from '@/app/dashboard/components/cards/DashboardContent';
import { useCentralizedDashboardData } from '@/lib/hooks/useCentralizedDashboardData';
import { DashboardSettingsProvider } from './components/cards/DashboardSettings';

function DashboardPageContent() {
  const { data, loading, error, refetch } = useCentralizedDashboardData();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full max-h-full">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full max-h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-status-error mb-4">Error Loading Dashboard</h2>
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

  return <DashboardContent data={data} onRefresh={refetch} />;
}

export default function DashboardPage() {
  return (
    <DashboardSettingsProvider>
      <div className="h-full max-h-full">
        <ErrorBoundary fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-status-error mb-4">Dashboard Error</h2>
              <p className="text-muted-foreground mb-4">Something went wrong with the dashboard.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        }>
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading dashboard..." />}>
            <DashboardPageContent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardSettingsProvider>
  );
}

/**
 * Change Log:
 * 12/19/24 - Version 2.0.0 - Grid Layout & Date Range Integration
 * - Implemented grid-based layout with irregular spacing for better widget emphasis
 * - Added comprehensive date range picker functionality with preset and custom options
 * - Integrated date filtering for all dashboard metrics and conversations
 * - Enhanced layout hierarchy with Analytics Snippet as primary widget
 * - Added real-time data filtering based on selected date range
 * - Improved responsive design with 12-column grid system
 * - Added conversation count indicator for selected date range
 * - Enhanced user experience with better visual hierarchy
 * 
 * 06/11/25 - Version 1.7.0
 * - Improved error handling with better fallback UI
 * - Enhanced loading states and user feedback
 * - Centralized component architecture with modular design
 * - Real-time data integration for welcome widget
 * - Better refresh functionality with loading states
 * - Improved resource links and navigation
 * - Enhanced analytics with performance insights
 * - Better usage overview with calculated metrics
 * 
 * 06/11/25 - Version 1.6.0
 * - Added DashboardSettingsProvider for centralized settings management
 * - Integrated enhanced analytics with ACS-themed colors
 * - Added modular component architecture
 * - Enhanced welcome widget with time-based greetings and quick stats
 * - Improved quick resources with tooltips and categorization
 * - Added comprehensive analytics with multiple chart types and time ranges
 * 
 * 06/11/25 - Version 1.5.0
 * - Updated to fit within max screen height container
 * - Improved height management for child components
 * - Enhanced responsive design
 * - Fixed layout hierarchy conflicts
 * - Removed redundant height containers
 * - Improved filter functionality
 * - Updated documentation format
 * - Added detailed feature descriptions
 * 
 * 5/26/25 - Version 1.1.0
 * - Extracted components: DeleteConfirmationModal, DashboardStyles, ConversationCard
 * - Extracted hooks: useOptimisticConversations, useDashboardMetrics
 * - Simplified Page component to act as a container
 * - Centralized type definitions
 * 
 * 5/25/25 - Version 1.0.0
 * - Created main dashboard with lead conversion pipeline
 * - Implemented performance metrics and analytics
 * - Added lead sources and activity tracking
 * - Integrated responsive design and interactive components
 */