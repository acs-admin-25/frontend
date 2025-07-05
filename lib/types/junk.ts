/**
 * File: types/junk.ts
 * Purpose: Type definitions for junk/spam management functionality
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

import type { Conversation } from './conversation';

export interface JunkMetrics {
  totalSpamDetected: number;
  totalFiltered: number;
  falsePositives: number;
  detectionRate: number;
  accuracyRate: number;
  spamByType: {
    genericMessages: number;
    suspiciousLinks: number;
    botBehavior: number;
    other: number;
  };
  spamTrends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  recentActivity: {
    flagged: number;
    reviewed: number;
    restored: number;
    deleted: number;
  };
}

export interface SpamPattern {
  id: string;
  pattern: string;
  type: 'generic' | 'suspicious_link' | 'bot_behavior' | 'other';
  confidence: number;
  occurrences: number;
  firstDetected: Date;
  lastDetected: Date;
}

export interface JunkAction {
  id: string;
  conversationId: string;
  action: 'flag' | 'unflag' | 'restore' | 'delete' | 'review';
  reason?: string;
  timestamp: Date;
  userId: string;
  automated: boolean;
}

export interface JunkFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  spamType?: 'all' | 'generic' | 'suspicious_link' | 'bot_behavior' | 'other';
  status?: 'all' | 'flagged' | 'reviewed' | 'restored' | 'deleted';
  confidence?: 'all' | 'high' | 'medium' | 'low';
  searchQuery?: string;
}

export interface JunkStats {
  totalConversations: number;
  flaggedConversations: number;
  reviewedConversations: number;
  restoredConversations: number;
  deletedConversations: number;
  falsePositiveRate: number;
  detectionAccuracy: number;
  averageReviewTime: number;
  spamPatterns: SpamPattern[];
  recentActions: JunkAction[];
}

export interface JunkData {
  conversations: Conversation[];
  metrics: JunkMetrics;
  stats: JunkStats;
  patterns: SpamPattern[];
  actions: JunkAction[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseJunkOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: JunkFilters;
  includeDeleted?: boolean;
  limit?: number;
}

export interface JunkManagementActions {
  flagConversation: (conversationId: string, reason?: string) => Promise<boolean>;
  unflagConversation: (conversationId: string) => Promise<boolean>;
  restoreConversation: (conversationId: string) => Promise<boolean>;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  reviewConversation: (conversationId: string, action: 'flag' | 'restore' | 'delete') => Promise<boolean>;
  bulkAction: (conversationIds: string[], action: 'flag' | 'restore' | 'delete') => Promise<boolean>;
  updateFilters: (filters: JunkFilters) => void;
  refetch: () => Promise<void>;
}

export interface SpamDetectionResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  patterns: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface JunkAnalytics {
  spamTrends: {
    date: string;
    flagged: number;
    reviewed: number;
    restored: number;
    deleted: number;
  }[];
  spamBySource: {
    source: string;
    count: number;
    percentage: number;
  }[];
  spamByTime: {
    hour: number;
    count: number;
  }[];
  falsePositiveAnalysis: {
    totalReviews: number;
    falsePositives: number;
    accuracyRate: number;
    commonFalsePositivePatterns: string[];
  };
} 