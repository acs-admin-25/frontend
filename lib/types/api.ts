export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
  headers?: Headers;
  timestamp?: string;
  request_id?: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
}

// Updated for GCP Firestore format
export interface DbSelectParams {
  table_name: string; // Legacy support - maps to collection_name
  index_name?: string; // Legacy support - not used in Firestore
  key_name: string;
  key_value: any;
}

export interface DbSelectResponse {
  items: any[];
  total_count: number;
  collection: string;
  filters_applied: {
    key_name: string;
    key_value: any;
    additional_filters: any;
  };
  ai_insights?: any;
}

// Updated for GCP Firestore format
export interface DbUpdateParams {
  table_name: string; // Legacy support - maps to collection_name
  index_name?: string; // Legacy support - not used in Firestore
  key_name: string;
  key_value: any;
  update_data: Record<string, any>;
}

export interface DbUpdateResponse {
  success: boolean;
  updated_count: number;
  document_id?: string;
}

// Updated for GCP Firestore format
export interface DbDeleteParams {
  table_name: string; // Legacy support - maps to collection_name
  attribute_name: string; // Legacy support - maps to key_name
  attribute_value: any; // Legacy support - maps to key_value
  is_primary_key?: boolean; // Legacy support - not used in Firestore
}

export interface DbDeleteResponse {
  success: boolean;
  deleted_count: number;
  document_id?: string;
}

// GCP-specific database parameters
export interface GcpDbSelectParams {
  collection_name: string;
  key_name?: string;
  key_value?: any;
  account_id: string;
  filters?: Record<string, any>;
  limit?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  include_ai_insights?: boolean;
}

export interface GcpDbUpdateParams {
  collection_name: string;
  key_name: string;
  key_value: any;
  update_data: Record<string, any>;
  account_id: string;
}

export interface GcpDbDeleteParams {
  collection_name: string;
  key_name: string;
  key_value: any;
  account_id: string;
}

export interface ThreadFilters {
  status?: ('active' | 'closed' | 'archived' | 'spam')[];
  dateFrom?: string;
  dateTo?: string;
  participants?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ThreadUpdate {
  status?: 'active' | 'closed' | 'archived' | 'spam';
  metadata?: Record<string, any>;
}

export interface Participant {
  id: string;
  threadId: string;
  email: string;
  name?: string;
  role: 'user' | 'assistant' | 'observer';
  joinedAt: string;
  lastSeenAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiRequest<T = any> {
  data?: T;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

// GCP Authentication types
export interface GcpAuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      rate_limit_per_minute: number;
    };
    session: {
      id: string;
      token: string;
      expires_at: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  request_id: string;
}

// Re-export the canonical types from conversation.ts
export type { Thread, Message, Conversation } from './conversation'; 