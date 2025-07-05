import React from 'react';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { ThemeDemoContent } from '@/components/features/theme/ThemeDemoContent';

export default function ThemeDemoPage() {
  return (
    <PageLayout title="Theme Demo" showNavbar={false}>
      <ErrorBoundary>
        <ThemeDemoContent />
      </ErrorBoundary>
    </PageLayout>
  );
} 