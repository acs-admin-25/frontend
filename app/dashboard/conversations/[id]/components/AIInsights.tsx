import React from 'react';
import { Brain, TrendingUp, Target, Calendar, DollarSign, Home } from 'lucide-react';
import type { Conversation } from '@/lib/types/conversation';
import type { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';

/**
 * AI Insights Component
 * Displays AI-generated insights about the conversation
 */
export function AIInsights({ 
  widget,
  conversation,
  actions,
  state,
  onRemoveWidget,
  onMakeWidgetFloat,
  className
}: { 
  widget?: WidgetInstance;
  conversation: Conversation | null;
  actions?: WidgetActions;
  state?: WidgetState;
  onRemoveWidget?: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}) {
  if (!conversation?.thread) {
    return (
      <div className="bg-card rounded-2xl border shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Insights
        </h3>
        <div className="text-sm text-muted-foreground">
          No conversation data available
        </div>
      </div>
    );
  }

  const thread = conversation.thread;
  const aiSummary = thread.ai_summary?.trim();
  const budgetRange = thread.budget_range?.trim();
  const propertyTypes = thread.preferred_property_types?.trim();
  const timeline = thread.timeline?.trim();
  
  const isEmpty = [aiSummary, budgetRange, propertyTypes, timeline].every((val) => !val || val === 'UNKNOWN');

  const insights = [
    { key: 'summary', label: 'Summary', value: aiSummary, icon: Brain },
    { key: 'budget', label: 'Budget', value: budgetRange, icon: DollarSign },
    { key: 'property-types', label: 'Property Types', value: propertyTypes, icon: Home },
    { key: 'timeline', label: 'Timeline', value: timeline, icon: Calendar }
  ].filter(insight => insight.value && insight.value !== 'UNKNOWN');

  return (
    <div className="bg-background rounded-lg p-2 h-full flex flex-col overflow-hidden">
      <h3 className="text-xs font-semibold mb-2 flex items-center gap-2 flex-shrink-0">
        <Brain className="w-3 h-3" />
        AI Insights
      </h3>
      {isEmpty ? (
        <div className="text-xs text-muted-foreground flex-1 flex items-center justify-center">
          No AI insights available
        </div>
      ) : (
        <div className="space-y-1 flex-1 overflow-y-auto min-h-0">
          {insights.map(insight => {
            const Icon = insight.icon;
            return (
              <div key={insight.key} className="flex items-start gap-2 text-xs">
                <Icon className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{insight.label}:</span>
                  <span className="text-muted-foreground ml-1 block truncate">{insight.value}</span>
                </div>
          </div>
            );
          })}
      </div>
      )}
    </div>
  );
} 