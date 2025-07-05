/**
 * File: components/features/conversations/CompactStatsSummary.tsx
 * Purpose: Compact stats summary for conversations page header
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

import React from 'react';
import { 
  MessageSquare, 
  Clock, 
  Target, 
  Mail,
  BarChart3,
  Settings,
  Users,
  AlertCircle,
  CheckCircle,
  Shield,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { 
  processConversationsData,
  calculateConversationMetrics,
  type ProcessedConversation
} from '@/lib/api/conversations';
import type { Conversation } from '@/types/conversation';

interface CompactStatsSummaryProps {
  conversations: Conversation[];
  onShowMetrics: () => void;
  className?: string;
}

export function CompactStatsSummary({ conversations, onShowMetrics, className }: CompactStatsSummaryProps) {
  // Process conversations to get enhanced metrics
  const processedConversations = processConversationsData(conversations);
  const metrics = calculateConversationMetrics(processedConversations);

  // Calculate key metrics
  const pendingEmails = processedConversations.filter(c => c.status === 'pending').length;
  const avgEVScore = metrics.averageEVScore;
  const highPriority = processedConversations.filter(c => 
    c.status === 'pending' || (c.evScore !== null && c.evScore > 80)
  ).length;
  const flagged = metrics.flagged;
  const spam = metrics.spam;

  return (
    <div className={cn("flex flex-row flex-wrap items-start", className)}>
      {/* Total Conversations - styled to match the modal card, icon left of content, with gray border and blue background icon */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-row items-center justify-center w-[220px] min-w-[180px] min-h-[120px] mb-2 mr-2">
        <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-500 mr-4 flex-shrink-0">
          <Users className="w-7 h-7 text-white" />
        </span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-500">Total</span>
          <span className="text-3xl font-bold text-blue-600 mt-1">{conversations.length}</span>
        </div>
      </div>

      {/* Active Conversations */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-row items-center justify-center w-[220px] min-w-[180px] min-h-[120px] mb-2 mr-2">
        <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-500 mr-4 flex-shrink-0">
          <Clock className="w-7 h-7 text-white" />
        </span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-500">Active</span>
          <span className="text-3xl font-bold text-green-600 mt-1">{metrics.active}</span>
        </div>
      </div>

      {/* Flagged Conversations */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-row items-center justify-center w-[220px] min-w-[180px] min-h-[120px] mb-2 mr-2">
        <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-500 mr-4 flex-shrink-0">
          <Shield className="w-7 h-7 text-white" />
        </span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-500">Flagged</span>
          <span className="text-3xl font-bold text-red-600 mt-1">{flagged}</span>
        </div>
      </div>

      {/* Pending Emails */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-row items-center justify-center w-[220px] min-w-[180px] min-h-[120px] mb-2 mr-2">
        <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-400 mr-4 flex-shrink-0">
          <AlertCircle className="w-7 h-7 text-white" />
        </span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-500">Pending</span>
          <span className="text-3xl font-bold text-yellow-600 mt-1">{pendingEmails}</span>
        </div>
      </div>

      {/* EV Score */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-row items-center justify-center w-[220px] min-w-[180px] min-h-[120px] mb-2 mr-2">
        <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-500 mr-4 flex-shrink-0">
          <TrendingUp className="w-7 h-7 text-white" />
        </span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-500">EV Score</span>
          <span className="text-3xl font-bold text-purple-600 mt-1">{avgEVScore.toFixed(1)}</span>
        </div>
      </div>

      {/* High Priority */}
      {highPriority > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-row items-center justify-center w-[220px] min-w-[180px] min-h-[120px] mb-2 mr-2">
          <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-400 mr-4 flex-shrink-0">
            <Clock className="w-7 h-7 text-white" />
          </span>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-500">Priority</span>
            <span className="text-3xl font-bold text-red-500 mt-1">{highPriority}</span>
          </div>
        </div>
      )}

      {/* View All Metrics Button and Settings Button - icon only, smaller boxes, vertically centered */}
      <div className="flex flex-row items-center justify-center ml-auto mr-0 mb-1 self-center gap-1">
        {[{
          key: 'metrics',
          onClick: onShowMetrics,
          icon: <BarChart3 className="w-5 h-5" />,
          label: 'View All Metrics',
          title: undefined,
          extraClass: ''
        }, {
          key: 'settings',
          onClick: () => window.location.href = '/dashboard/settings',
          icon: <Settings className="w-5 h-5" />,
          label: 'Settings',
          title: 'Settings',
          extraClass: 'items-center justify-center'
        }].map(btn => (
          <button
            key={btn.key}
            onClick={btn.onClick}
            className={cn(
              "flex flex-col bg-gray-200 rounded-xl p-2 shadow-sm min-w-[70px] w-[70px] cursor-pointer border-2 border-transparent hover:border-muted transition-all",
              btn.extraClass
            )}
            type="button"
            title={btn.title}
            style={{ alignSelf: 'center' }}
          >
            <div className="flex items-center justify-center w-full h-full" style={{ minHeight: 32 }}>
              <span className="p-1 bg-muted/60 rounded-full flex items-center justify-center">
                {btn.icon}
              </span>
            </div>
            <span className="sr-only">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}