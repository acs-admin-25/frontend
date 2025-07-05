import React from 'react';
import { Brain, TrendingUp, Target, Calendar, DollarSign, Home } from 'lucide-react';
import type { Thread } from '@/types/conversation';

/**
 * AI Insights Component
 * Displays AI-generated insights about the conversation
 */
export function AIInsights({ thread }: { thread: Thread | null }) {
  if (!thread) return null;

  const aiSummary = thread.ai_summary?.trim();
  const budgetRange = thread.budget_range?.trim();
  const propertyTypes = thread.preferred_property_types?.trim();
  const timeline = thread.timeline?.trim();
  
  const isEmpty = [aiSummary, budgetRange, propertyTypes, timeline].every((val) => !val || val === 'UNKNOWN');
  
  if (isEmpty) return null;

  const insights = [
    { key: 'summary', label: 'Summary', value: aiSummary },
    { key: 'budget', label: 'Budget', value: budgetRange },
    { key: 'property-types', label: 'Property Types', value: propertyTypes },
    { key: 'timeline', label: 'Timeline', value: timeline }
  ].filter(insight => insight.value && insight.value !== 'UNKNOWN');

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
      <div className="space-y-3">
        {insights.map(insight => (
          <div key={insight.key} className="text-gray-700">
            <span className="font-medium">{insight.label}:</span> {insight.value}
          </div>
        ))}
      </div>
    </div>
  );
} 