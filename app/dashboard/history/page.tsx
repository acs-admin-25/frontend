/**
 * File: app/dashboard/history/page.tsx
 * Purpose: History page with centralized data processing and modular components
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.0.0
 */

'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { HistoryContent } from './HistoryContent';

export default function HistoryPage() {
  return (
    <div 
      className="w-full bg-gray-50"
      style={{ minHeight: '100vh', overflow: 'auto' }}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading history..." />}>
          <HistoryContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 