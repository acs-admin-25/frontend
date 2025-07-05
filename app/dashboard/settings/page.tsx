"use client";

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { SettingsContent } from './SettingsContent';

export default function SettingsPage() {
    return (
        <div 
            className="min-h-screen bg-muted"
            style={{ minHeight: '100vh', overflow: 'auto' }}
        >
            <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner size="lg" text="Loading settings..." />}>
                    <SettingsContent />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
