import type { Conversation } from './conversation';

export interface DashboardData {
  metrics: DashboardMetrics;
  conversations: Conversation[];
  analytics: DashboardAnalytics;
  recentActivity: DashboardActivity[];
  usage: DashboardUsage;
}

export interface DashboardMetrics {
  totalConversations: number;
  activeConversations: number;
  totalLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  monthlyGrowth: number;
  totalRevenue: number;
  averageDealSize: number;
}

export interface DashboardUsage {
  emailsSent: number;
  logins: number;
  activeDays: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Re-export the canonical Conversation type
export type { Conversation } from './conversation';

export interface DashboardAnalytics {
  conversationTrend: ChartData;
  leadSourceBreakdown: ChartData;
  responseTimeTrend: ChartData;
  conversionFunnel: ChartData;
  revenueTrend: ChartData;
}

export interface DashboardActivity {
  id: string;
  type: 'conversation' | 'lead' | 'deal' | 'message';
  action: string;
  description: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  priority?: string[];
  search?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  data: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config?: Record<string, any>;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  rowHeight: number;
  gap: number;
} 