
"use client";

import React from "react";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { cn } from '@/lib/utils/utils';
import { applyTheme, greenTheme } from "../../../lib/theme/simple-theme";
import { GetInTouchSection, SendMessageSection, FAQSection } from "../../(marketing)/contact/components";
import { CONTAINER_VARIANTS, ITEM_VARIANTS } from "../../(marketing)/contact/constants/animations";

function SupportContent() {
  const router = useRouter();

  React.useEffect(() => {
    applyTheme(greenTheme);
  }, []);

  return (
    <div className="w-full bg-white overflow-auto" style={{ minHeight: '100vh' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors text-gray-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0a5a2f] via-[#0e6537] to-[#157a42] rounded-2xl mb-6 shadow-lg">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#0a2f1f] via-[#0e6537] to-[#157a42] bg-clip-text text-transparent mb-4">
            Support Center
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our support team, send us a message, or browse our frequently asked questions.
          </p>
        </div>

        {/* Support Content Area mimicking contact page */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-5 max-w-6xl mx-auto">
          <GetInTouchSection variants={ITEM_VARIANTS} />
          <SendMessageSection variants={ITEM_VARIANTS} />
        </div>
        <div className="max-w-6xl mx-auto mt-12">
          <FAQSection variants={ITEM_VARIANTS} />
        </div>
      </div>
    </div>
  );
}

export default function SupportCenterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading support..." />}>
        <SupportContent />
      </Suspense>
    </ErrorBoundary>
  );
}
