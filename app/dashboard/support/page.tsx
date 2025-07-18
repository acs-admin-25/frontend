
"use client";

import React from "react";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { Suspense } from 'react';
import { FAQSection } from "./components/FAQSection";
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { cn } from '@/lib/utils/utils';
import { applyTheme, greenTheme } from "../../../lib/theme/simple-theme";
import { GetInTouchSection } from "./components/GetInTouchSection";
import { SendMessageSection } from "./components/SendMessageSection";
import { FAQS } from "../../(marketing)/contact/constants";
import { CONTAINER_VARIANTS, ITEM_VARIANTS } from "../../(marketing)/contact/constants/animations";

function SupportContent() {
  const router = useRouter();

  React.useEffect(() => {
    applyTheme(greenTheme);
  }, []);

  // Search state and logic
  const [searchQuery, setSearchQuery] = React.useState("");
  // FAQ/section search logic
  const normalizedQuery = searchQuery.trim().toLowerCase();
  // Define the FAQ/section data for search
  const supportFaqs: Array<{
    q: string;
    a: React.ReactNode;
    keywords: string[];
  }> = [
    {
      q: 'What is EV Score?',
      a: <>{'EV Score or Engagement Value, represents a measurement that predicts how likely a lead is to convert, powered by AI.'} <a href="/dashboard/resources?tab=ai-features" className="text-primary underline hover:text-secondary transition-colors">See full explanation here</a></>,
      keywords: ['ev score', 'engagement value', 'ai', 'score', 'lead', 'convert']
    },
    {
      q: 'Why is my email not syncing?',
      a: <a href="/dashboard/resources?tab=troubleshooting" className="text-primary underline hover:text-secondary transition-colors">Quick and easy Troubleshooting</a>,
      keywords: ['email', 'sync', 'not syncing', 'troubleshooting', 'email issue']
    },
    ...FAQS.slice(2).map((faq: {q: string, a: string}, idx: number) => ({
      q: faq.q,
      a: <>{faq.a}{faq.q.toLowerCase().includes('payment') && (<><a href="/dashboard/resources?tab=usage-analytics" className="text-primary underline hover:text-secondary transition-colors"> See more information here</a></>)}</>,
      keywords: [faq.q.toLowerCase(), faq.a.toLowerCase()]
    }))
  ];

  let filteredFaqs = supportFaqs;
  if (normalizedQuery.length > 0) {
    filteredFaqs = supportFaqs.filter((faq) =>
      faq.keywords.some((kw: string) => kw.includes(normalizedQuery)) ||
      faq.q.toLowerCase().includes(normalizedQuery) ||
      (typeof faq.a === 'string' ? faq.a.toLowerCase().includes(normalizedQuery) : false)
    );
  }

  // Keywords that should trigger the message/contact sections to appear at the top
  const priorityKeywords = ['search', 'report', 'issue', 'problem', 'bug', 'feedback', 'support', 'help'];
  const isPriorityQuery = priorityKeywords.some(kw => normalizedQuery.includes(kw));

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

        {/* Search Bar with Icon */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-2xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#0a5a2f] via-[#0e6537] to-[#157a42] shadow">
              {/* Lucide Search icon, white */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="How can we help?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-base text-gray-800"
              aria-label="Support search"
            />
          </div>
        </div>

        {/* Conditional Content Area */}
        <div className="max-w-6xl mx-auto">
          {isPriorityQuery && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-5 mb-8">
              <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-8">
                <SendMessageSection variants={ITEM_VARIANTS} />
              </div>
              <div className="md:col-span-5 lg:col-span-4">
                <GetInTouchSection variants={ITEM_VARIANTS} />
              </div>
            </div>
          )}
          <div className="mb-8">
            <FAQSection variants={ITEM_VARIANTS} faqs={filteredFaqs} />
          </div>
          {!isPriorityQuery && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-5">
              <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-8">
                {/* Show SendMessageSection if no search or if the query matches the send message/email topics */}
                {filteredFaqs.length === 0 || filteredFaqs.some(faq => faq.q === 'Why is my email not syncing?' || faq.q === 'What is EV Score?') ? (
                  <SendMessageSection variants={ITEM_VARIANTS} />
                ) : null}
              </div>
              <div className="md:col-span-5 lg:col-span-4">
                {/* Show GetInTouchSection if no search or if the query matches the send message/email topics */}
                {filteredFaqs.length === 0 || filteredFaqs.some(faq => faq.q === 'Why is my email not syncing?' || faq.q === 'What is EV Score?') ? (
                  <GetInTouchSection variants={ITEM_VARIANTS} />
                ) : null}
              </div>
            </div>
          )}
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
