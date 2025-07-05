/**
 * File: app/error/page.tsx
 * Purpose: Error page with auth feedback
 * - Navigation and redirect functionality
 * - Automatic redirect timer
 * - Full-screen responsive layout
 * - Centered content alignment

 * - Error description text
 * - Redirect notification
 * Author: acagliol
 * Date: 06/15/25
 * Version: 1.0.0
 */

/**
 * Page Component
 * 
 * Features:
 * - URL parameter handling for error messages
 * - Navigation and redirect functionality
 * - Automatic redirect timer
 * - Full-screen responsive layout
 * - Centered content alignment
 * - Error message header
 * - Error description text
 * - Redirect notification * 
 * Sections:

 * - Navigation and redirect functionality
 * - Automatic redirect timer
 * - Full-screen responsive layout
 * - Centered content alignment

 * - Error description text
 * - Redirect notification * 
 * @returns {JSX.Element} Rendered component with error handling and user feedback
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { AlertTriangle } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const getErrorMessage = () => {
      switch (error) {
          case 'AccessDenied':
              return 'You do not have permission to access this page.';
          case 'auth_processing_failed':
              return 'There was an issue processing your login.';
          case 'not_authenticated':
              return 'You are not authenticated.';
          default:
              return 'An unknown error occurred during authentication.';
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Authentication Error</h1>
        <p className="text-lg text-gray-600 mb-8">{getErrorMessage()}</p>
        <p className="text-gray-500">Redirecting to the login page...</p>
    </div>
  );
}

function ErrorFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Loading Error...</h1>
        </div>
    );
}

export default function ErrorPage() {
  return (
    <PageLayout>
        <Suspense fallback={<ErrorFallback />}>
        <ErrorContent />
        </Suspense>
    </PageLayout>
  );
}

/**
 * Change Log:
 * 06/15/25 - Version 1.0.0
 * - Initial version
 */

