import { handleApiError } from './errorHandling';
import { conversationStorage } from '@/lib/utils/ConversationStorage';
import type { 
  ApiResponse, 
  RequestOptions, 
  DbSelectParams, 
  DbSelectResponse,
  DbUpdateParams,
  DbUpdateResponse,
  DbDeleteParams,
  DbDeleteResponse,
  ThreadFilters,
  ThreadUpdate,
} from '@/types/api';
import type { Thread, Conversation } from '@/types/conversation';
import type { LCPEmailRequest } from '@/types/lcp';

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['NetworkError', 'fetch', 'timeout', 'ECONNRESET', 'ENOTFOUND']
};

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private currentUserId: string | null = null;
  private retryConfig: RetryConfig;

  constructor(retryConfig?: Partial<RetryConfig>) {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Calculate delay for retry with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any, status?: number): boolean {
    // Check status codes
    if (status && this.retryConfig.retryableStatuses.includes(status)) {
      return true;
    }

    // Check error messages
    const errorMessage = error?.message || error?.toString() || '';
    return this.retryConfig.retryableErrors.some(retryableError => 
      errorMessage.toLowerCase().includes(retryableError.toLowerCase())
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Initialize the API client with user ID for storage operations
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
    conversationStorage.initialize(userId);
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body)}`;
    
    // Check cache for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    let lastError: any = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            ...this.defaultHeaders,
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include',
          // Add timeout for fetch
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        const hasContent = contentType && contentType.includes('application/json');
        
        let data: any;
        
        if (hasContent) {
          try {
            const responseText = await response.text();
            // Only try to parse JSON if there's actual content
            if (responseText.trim()) {
              data = JSON.parse(responseText);
            } else {
              console.warn(`[ApiClient] Empty response body for ${endpoint}`);
              data = null;
            }
          } catch (jsonError) {
            const responseText = await response.text().catch(() => 'Unable to read response text');
            console.error(`[ApiClient] JSON parsing error for ${endpoint}:`, {
              error: jsonError instanceof Error ? jsonError.message : String(jsonError),
              status: response.status,
              statusText: response.statusText,
              url,
              responseLength: responseText?.length || 0,
              responsePreview: responseText?.substring(0, 200) || 'No content'
            });
            data = null;
          }
        } else {
          console.warn(`[ApiClient] Non-JSON response for ${endpoint}:`, {
            contentType,
            status: response.status,
            statusText: response.statusText
          });
          data = null;
        }
        
        if (!response.ok) {
          // Don't retry on authentication errors
          if (response.status === 401 || response.status === 403) {
            throw handleApiError({ status: response.status, data });
          }
          
          // Check if this is a retryable error
          if (this.isRetryableError(data, response.status)) {
            lastError = handleApiError({ status: response.status, data });
            
            // If this is the last attempt, throw the error
            if (attempt === this.retryConfig.maxRetries) {
              throw lastError;
            }
            
            // Calculate delay and retry
            const delay = this.calculateDelay(attempt);
            console.warn(`[ApiClient] Retryable error on attempt ${attempt}/${this.retryConfig.maxRetries} for ${endpoint}, retrying in ${delay}ms:`, {
              status: response.status,
              error: data?.error || data?.message || 'Unknown error'
            });
            
            await this.sleep(delay);
            continue;
          }
          
          // Non-retryable error, throw immediately
          throw handleApiError({ status: response.status, data });
        }

        const result: ApiResponse<T> = {
          success: true,
          data,
          status: response.status,
        };

        // Cache successful GET requests
        if (options.method === 'GET' || !options.method) {
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        }

        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if this is a retryable error
        if (this.isRetryableError(error)) {
          // If this is the last attempt, break and throw the error
          if (attempt === this.retryConfig.maxRetries) {
            break;
          }
          
          // Calculate delay and retry
          const delay = this.calculateDelay(attempt);
          console.warn(`[ApiClient] Retryable error on attempt ${attempt}/${this.retryConfig.maxRetries} for ${endpoint}, retrying in ${delay}ms:`, {
            error: error instanceof Error ? error.message : String(error)
          });
          
          await this.sleep(delay);
          continue;
        }
        
        // Non-retryable error, throw immediately
        break;
      }
    }
    
    // More robust error logging
    const errorInfo = {
      message: lastError instanceof Error ? lastError.message : String(lastError),
      name: lastError instanceof Error ? lastError.name : 'Unknown',
      stack: lastError instanceof Error ? lastError.stack : undefined,
      type: typeof lastError,
      url,
      endpoint,
      method: options.method || 'GET',
      attempts: this.retryConfig.maxRetries
    };
    
    console.error(`[ApiClient] Request failed after ${this.retryConfig.maxRetries} attempts for ${endpoint}:`, errorInfo);
    
    const appError = handleApiError(lastError);
    return {
      success: false,
      error: appError.message,
      status: appError.status || 500,
    };
  }

  // Database operations with optimistic updates
  async dbSelect(params: DbSelectParams): Promise<ApiResponse<DbSelectResponse>> {
    return this.request<DbSelectResponse>('db/select', { method: 'POST', body: params });
  }

  async dbUpdate(params: DbUpdateParams): Promise<ApiResponse<DbUpdateResponse>> {
    // Apply optimistic update for conversation-related updates
    if (params.table_name === 'Threads' && params.key_name === 'conversation_id') {
      const conversationId = params.key_value;
      const updates = params.update_data;
      
      // Apply optimistic update to local storage
      if (this.currentUserId) {
        conversationStorage.updateConversation(conversationId, {
          thread: {
            conversation_id: conversationId,
            ...updates
          } as any
        });
      }
    }

    const response = await this.request<DbUpdateResponse>('db/update', { method: 'POST', body: params });
    
    // If update failed, we could implement rollback here
    if (!response.success && this.currentUserId) {
      console.warn('[ApiClient] Database update failed, optimistic update may be stale');
    }
    
    return response;
  }

  async dbDelete(params: DbDeleteParams): Promise<ApiResponse<DbDeleteResponse>> {
    // Apply optimistic update for conversation deletion
    if (params.table_name === 'Threads' && params.attribute_name === 'conversation_id') {
      const conversationId = params.attribute_value;
      
      // Apply optimistic update to local storage
      if (this.currentUserId) {
        conversationStorage.removeConversation(conversationId);
      }
    }

    const response = await this.request<DbDeleteResponse>('db/delete', { method: 'POST', body: params });
    
    // If deletion failed, we could implement rollback here
    if (!response.success && this.currentUserId) {
      console.warn('[ApiClient] Database deletion failed, optimistic update may be stale');
    }
    
    return response;
  }

  // LCP operations with storage integration
  async getThreads(filters?: ThreadFilters): Promise<ApiResponse<{ data: any[] }>> {
    console.log('[ApiClient] getThreads called:', {
      hasFilters: !!filters,
      filters,
      currentUserId: this.currentUserId,
      hasCachedData: this.currentUserId ? conversationStorage.hasData() : false,
      isStale: this.currentUserId ? conversationStorage.isStale(10) : false
    });

    // Check if we have cached data and it's not stale
    if (this.currentUserId && conversationStorage.hasData() && !conversationStorage.isStale(10)) {
      const cachedConversations = conversationStorage.getConversations();
      if (cachedConversations) {
        console.log('[ApiClient] Using cached conversations data:', {
          conversationCount: cachedConversations.length,
          sampleConversation: cachedConversations[0] ? {
            id: cachedConversations[0].thread.conversation_id,
            lead_name: cachedConversations[0].thread.lead_name
          } : null
        });
        return {
          success: true,
          data: { data: cachedConversations },
          status: 200
        };
      }
    }

    console.log('[ApiClient] Making API request to get_all_threads...');
    // Ensure we always send a proper request body, even if filters is undefined
    const requestBody = filters || {};
    const response = await this.request<{ data: any[] }>('lcp/get_all_threads', { method: 'POST', body: requestBody });
    
    console.log('[ApiClient] API response received:', {
      success: response.success,
      hasData: !!response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : null,
      dataLength: response.data?.data?.length,
      error: response.error,
      status: response.status
    });
    
    // Store successful responses in local storage
    if (response.success && response.data?.data && this.currentUserId) {
      console.log('[ApiClient] Storing conversations in local storage:', {
        conversationCount: response.data.data.length
      });
      conversationStorage.storeConversations(response.data.data);
    }
    
    return response;
  }

  async getThreadById(conversationId: string): Promise<ApiResponse<Thread>> {
    const cacheKey = `thread:${conversationId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    return this.request<Thread>(`lcp/getThreadById`, { method: 'POST', body: { conversation_id: conversationId } });
  }

  async updateThread(conversationId: string, updates: ThreadUpdate): Promise<ApiResponse<Thread>> {
    // Apply optimistic update
    if (this.currentUserId) {
      conversationStorage.updateConversation(conversationId, {
        thread: {
          conversation_id: conversationId,
          ...updates
        } as any
      });
    }

    // Use dbUpdate instead of the non-existent lcp/update_thread endpoint
    const dbUpdateParams: DbUpdateParams = {
      table_name: 'Threads',
      index_name: 'conversation_id-index',
      key_name: 'conversation_id',
      key_value: conversationId,
      update_data: updates
    };

    const response = await this.dbUpdate(dbUpdateParams);
    
    // If update failed, we could implement rollback here
    if (!response.success && this.currentUserId) {
      console.warn('[ApiClient] Thread update failed, optimistic update may be stale');
    }
    
    // Return a Thread response to maintain compatibility
    return {
      success: response.success,
      data: response.success ? { conversation_id: conversationId, ...updates } as Thread : undefined,
      error: response.error,
      status: response.status
    };
  }

  async deleteThread(conversationId: string): Promise<ApiResponse<void>> {
    // Apply optimistic update
    if (this.currentUserId) {
      conversationStorage.removeConversation(conversationId);
    }

    const response = await this.request<void>('lcp/delete_thread', { method: 'POST', body: { conversation_id: conversationId } });
    
    // If deletion failed, we could implement rollback here
    if (!response.success && this.currentUserId) {
      console.warn('[ApiClient] Thread deletion failed, optimistic update may be stale');
    }
    
    return response;
  }

  async markNotSpam(conversationId: string): Promise<ApiResponse<void>> {
    // Apply optimistic update
    if (this.currentUserId) {
      conversationStorage.updateConversation(conversationId, {
        thread: {
          conversation_id: conversationId,
          spam: false
        } as any
      });
    }

    const response = await this.request<void>('lcp/mark_not_spam', { method: 'POST', body: { conversation_id: conversationId } });
    
    // If update failed, we could implement rollback here
    if (!response.success && this.currentUserId) {
      console.warn('[ApiClient] Mark not spam failed, optimistic update may be stale');
    }
    
    return response;
  }

  async sendEmail(emailRequest: LCPEmailRequest): Promise<ApiResponse<void>> {
    return this.request('lcp/send_email', { method: 'POST', body: emailRequest });
  }

  async getLLMResponse(request: any): Promise<ApiResponse<any>> {
    return this.request('lcp/get_llm_response', { method: 'POST', body: request });
  }

  // Authentication operations
  async login(credentials: { email: string; password: string; provider?: string; name?: string }): Promise<ApiResponse<any>> {
    return this.request('api/auth/login', { method: 'POST', body: credentials });
  }

  async signup(userData: any): Promise<ApiResponse<any>> {
    return this.request('api/auth/signup', { method: 'POST', body: userData });
  }

  async logout(): Promise<ApiResponse<void>> {
    // Clear local storage on logout
    if (this.currentUserId) {
      conversationStorage.clear();
      this.currentUserId = null;
    }
    return this.request('auth/logout', { method: 'POST' });
  }

  // Contact operations
  async submitContact(formData: any): Promise<ApiResponse<void>> {
    return this.request('contact', { method: 'POST', body: formData });
  }

  // Usage statistics
  async getUsageStats(): Promise<ApiResponse<any>> {
    return this.request('usage/stats', { method: 'GET' });
  }

  // Domain verification
  async verifyDomain(domain: string): Promise<ApiResponse<any>> {
    return this.request('domain/verify-identity', { method: 'POST', body: { domain } });
  }

  async verifyDKIM(domain: string): Promise<ApiResponse<any>> {
    return this.request('domain/verify-dkim', { method: 'POST', body: { domain } });
  }

  async verifyEmailValidity(uid: string, email: string): Promise<ApiResponse<any>> {
    return this.request('domain/verify-email-validity', { method: 'POST', body: { uid, newEmail: email } });
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((value, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  // Get storage statistics
  getStorageStats() {
    return conversationStorage.getStats();
  }

  // Force refresh conversations from server
  async refreshConversations(): Promise<ApiResponse<{ data: any[] }>> {
    // Clear cache and force fresh fetch
    this.clearCacheEntry('lcp/get_all_threads');
    if (this.currentUserId) {
      conversationStorage.clear();
    }
    return this.getThreads();
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Server-side API client for NextAuth callbacks
export class ServerApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // For server-side calls, we need to use the full URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000';
    this.baseURL = host.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      const hasContent = contentType && contentType.includes('application/json');
      
      let data: any;
      
      if (hasContent) {
        try {
          const responseText = await response.text();
          // Only try to parse JSON if there's actual content
          if (responseText.trim()) {
            data = JSON.parse(responseText);
          } else {
            data = null;
          }
        } catch (jsonError) {
          const responseText = await response.text().catch(() => 'Unable to read response text');
          console.error(`[ServerApiClient] JSON parsing error for ${endpoint}:`, {
            error: jsonError instanceof Error ? jsonError.message : String(jsonError),
            status: response.status,
            statusText: response.statusText,
            url,
            responseLength: responseText?.length || 0,
            responsePreview: responseText?.substring(0, 200) || 'No content'
          });
          data = null;
        }
      } else {
        console.warn(`[ServerApiClient] Non-JSON response for ${endpoint}:`, {
          contentType,
          status: response.status,
          statusText: response.statusText
        });
        data = null;
      }
      
      if (!response.ok) {
        throw handleApiError({ status: response.status, data });
      }

      const result: ApiResponse<T> = {
        success: true,
        data,
        status: response.status,
      };

      return result;
    } catch (error) {
      // More robust error logging
      const errorInfo = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        url,
        endpoint,
        method: options.method || 'GET'
      };
      
      console.error(`[ServerApiClient] Request error for ${endpoint}:`, errorInfo);
      
      const appError = handleApiError(error);
      return {
        success: false,
        error: appError.message,
        status: appError.status || 500,
      };
    }
  }

  // Authentication operations
  async login(credentials: { email: string; password: string; provider?: string; name?: string }): Promise<ApiResponse<any>> {
    return this.request('api/auth/login', { method: 'POST', body: credentials });
  }

  async signup(userData: any): Promise<ApiResponse<any>> {
    return this.request('api/auth/signup', { method: 'POST', body: userData });
  }
}

// Server-side singleton instance
export const serverApiClient = new ServerApiClient();