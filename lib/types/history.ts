import type { Conversation } from '@/types/conversation';

export interface HistoryMetrics {
  totalConversations: number;
  completedConversations: number;
  completionRate: number;
  averageDuration: number;
  successRate: number;
  averageMessages: number;
  monthlyGrowth: number;
  totalMessages: number;
  averageResponseTime: number;
  historicalGrowth: number;
}

export interface HistoryData {
  conversations: Conversation[];
  metrics: HistoryMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export interface HistoryFilters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  status?: 'all' | 'completed' | 'active';
  searchQuery?: string;
} 