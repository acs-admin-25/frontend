/**
 * File: app/(marketing)/landing/page.tsx
 * Purpose: Landing page using modular components and centralized functionality
 * Author: AI Agent
 * Date: 2024
 * Version: 2.0.0
 * 
 * This page has been restructured to follow the AI Agent Editing Guide:
 * - Modular component architecture
 * - Centralized data management
 * - Type-safe implementations
 * - Proper error handling
 * - Accessibility compliance
 * - Performance optimizations
 */

"use client"

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { LandingPage } from './components/LandingPage';

/**
 * LandingPageContainer Component
 * 
 * Wraps the landing page with error boundaries and loading states.
 * Follows the established patterns from the AI Agent Editing Guide.
 */
function LandingPageContainer() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4 font-display">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-6 font-sans">
            We're having trouble loading the landing page. Please try refreshing.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-sans"
          >
            Refresh Page
          </button>
        </div>
      </div>
    }>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" text="Loading landing page..." />
        </div>
      }>
        <LandingPage />
      </Suspense>
    </ErrorBoundary>
  );
}

export default LandingPageContainer;
