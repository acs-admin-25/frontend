export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface ConversationMetrics {
  totalMessages: number;
  averageMessagesPerConversation: number;
  responseTime: number;
  satisfactionScore: number;
}

export interface LeadMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageValue: number;
  sourceBreakdown: Record<string, number>;
}

export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  category?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  fields: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  fields: string[];
  filters?: FilterOptions;
  filename?: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface AuditLog extends BaseEntity {
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
} 