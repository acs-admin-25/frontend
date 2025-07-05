import type { Conversation } from './conversation';
import type { DashboardMetrics, DashboardAnalytics } from './dashboard';

export interface AnalyticsMetric {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  description?: string;
  color?: string;
}

export interface EVDataPoint {
  messageNumber: number;
  averageEV: number;
  totalMessages: number;
  conversationCount: number;
}

export interface AnalyticsData {
  keyMetrics: AnalyticsMetric[];
  evByMessage: EVDataPoint[];
  dateRange: string;
  lastUpdated: string;
  conversations: Conversation[];
  metrics: DashboardMetrics | null;
  analytics: DashboardAnalytics | null;
}

export interface AnalyticsFilters {
  dateRange: '7d' | '30d' | '90d' | 'custom' | 'all';
  startDate?: string;
  endDate?: string;
  conversationStatus?: 'all' | 'active' | 'completed' | 'flagged';
  leadSource?: string;
  searchQuery?: string;
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  lastUpdated: Date | null;
}

export interface AnalyticsContextType extends AnalyticsState {
  refetch: () => Promise<void>;
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  getFilteredConversations: () => Conversation[];
  getMetrics: () => DashboardMetrics | null;
  getAnalytics: () => DashboardAnalytics | null;
}

export interface ChartConfig {
  height?: number;
  width?: number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  responsive?: boolean;
}

// Legacy types for backward compatibility
export interface LeadSourceData {
  source: string;
  percentage: number;
  count: number;
  conversionRate: number;
}

export interface ConversionTrendData {
  month: string;
  conversion: number;
  leads: number;
  revenue?: number;
}

export interface AnalyticsChartData {
  leadSources: LeadSourceData[];
  conversionTrends: ConversionTrendData[];
  evByMessage: EVDataPoint[];
} 