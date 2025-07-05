import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, DollarSign, Calendar, Home, Target } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { Conversation } from '@/types/conversation';

interface EnhancedAIInsightsProps {
  conversation: Conversation | null;
  className?: string;
}

interface InsightItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

export function EnhancedAIInsights({ conversation, className }: EnhancedAIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!conversation?.thread) return null;

  const {
    ai_summary,
    budget_range,
    timeline,
    preferred_property_types,
    priority,
    flag,
    spam,
    busy,
    lcp_enabled
  } = conversation.thread;

  // Extract insights from thread data
  const insights: InsightItem[] = [
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Budget',
      value: budget_range || 'Not specified',
      color: 'text-green-600'
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Timeline',
      value: timeline || 'Not specified',
      color: 'text-blue-600'
    },
    {
      icon: <Home className="w-4 h-4" />,
      label: 'Property Type',
      value: preferred_property_types || 'Not specified',
      color: 'text-purple-600'
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: 'Priority',
      value: priority || 'Standard',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border shadow-sm",
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-secondary-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {/* AI Summary */}
          {ai_summary && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {ai_summary}
              </p>
            </div>
          )}

          {/* Extracted Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Extracted Information</h4>
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={cn(
                  "w-8 h-8 bg-card rounded-lg flex items-center justify-center",
                  insight.color
                )}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{insight.label}</p>
                  <p className="text-sm text-gray-600">{insight.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Conversation Status */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
            <div className="flex flex-wrap gap-2">
              {flag && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  Flagged
                </span>
              )}
              {spam && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Spam
                </span>
              )}
              {busy && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Busy
                </span>
              )}
              {lcp_enabled && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  LCP Enabled
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 