export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
  headers?: Headers;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
}

export interface DbSelectParams {
  table_name: string;
  index_name: string;
  key_name: string;
  key_value: any;
}

export interface DbSelectResponse {
  items: any[];
  total: number;
}

export interface DbUpdateParams {
  table_name: string;
  index_name: string;
  key_name: string;
  key_value: any;
  update_data: Record<string, any>;
}

export interface DbUpdateResponse {
  success: boolean;
  updated: number;
}

export interface DbDeleteParams {
  table_name: string;
  attribute_name: string;
  attribute_value: any;
  is_primary_key: boolean;
}

export interface DbDeleteResponse {
  success: boolean;
  deleted: number;
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

// Re-export the canonical types from conversation.ts
export type { Thread, Message, Conversation } from './conversation'; 