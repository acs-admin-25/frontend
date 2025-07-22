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
} from '../types/api';
import type { Thread, Conversation } from '../types/conversation';
import type { LCPEmailRequest } from '../types/lcp';

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
  private backendToken: string | null = null;

  constructor(retryConfig?: Partial<RetryConfig>) {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Set the backend JWT token for API calls
   * @param token The JWT token from NextAuth session
   */
  setBackendToken(token: string): void {
    this.backendToken = token;
  }

  /**
   * Clear the backend JWT token
   */
  clearBackendToken(): void {
    this.backendToken = null;
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
   * Parse response data
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    const hasContent = contentType && contentType.includes('application/json');
    
    if (hasContent) {
      try {
        const responseText = await response.text();
        if (responseText.trim()) {
          return JSON.parse(responseText);
        }
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
      }
    }
    return null;
  }

  /**
   * Initialize the API client with user ID
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Make authenticated request to backend API
   */
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

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Add authorization header if backend token exists
    if (this.backendToken && !endpoint.includes('/auth/')) {
      headers.Authorization = `Bearer ${this.backendToken}`;
    }

    let lastError: any = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include',
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        const data = await this.parseResponse(response);
        
        if (!response.ok) {
          // Handle 401 errors (token expired or invalid)
          if (response.status === 401) {
            console.warn('[ApiClient] Unauthorized request, token may be expired');
            // Clear the token so user can re-authenticate
            this.clearBackendToken();
          }
          
          const errorResponse: ApiResponse<T> = {
            success: false,
            error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            data: undefined
          };
          
          // Cache error responses for a short time to prevent hammering
          if (response.status === 429 || response.status >= 500) {
            this.cache.set(cacheKey, { data: errorResponse, timestamp: Date.now() });
          }
          
          return errorResponse;
        }

        const result: ApiResponse<T> = {
          success: true,
          data: data,
          status: response.status
        };

        // Cache successful responses
        if (options.method === 'GET' || !options.method) {
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        }

        return result;

      } catch (error) {
        lastError = error;
        console.error(`[ApiClient] Request failed (attempt ${attempt}/${this.retryConfig.maxRetries}):`, {
          endpoint,
          error: error instanceof Error ? error.message : String(error),
          attempt
        });

        if (attempt < this.retryConfig.maxRetries && this.isRetryableError(error)) {
          const delay = this.calculateDelay(attempt);
          console.log(`[ApiClient] Retrying in ${delay}ms...`);
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }

         // All retries failed
     const errorResponse: ApiResponse<T> = {
       success: false,
       error: lastError instanceof Error ? lastError.message : 'Request failed after all retries',
       status: 0,
       data: undefined
     };

    return errorResponse;
  }

  // Database operations
  async dbSelect(params: DbSelectParams): Promise<ApiResponse<DbSelectResponse>> {
    return this.request<DbSelectResponse>('db/select', {
      method: 'POST',
      body: params
    });
  }

  async dbUpdate(params: DbUpdateParams): Promise<ApiResponse<DbUpdateResponse>> {
    return this.request<DbUpdateResponse>('db/update', {
      method: 'POST',
      body: params
    });
  }

  async dbDelete(params: DbDeleteParams): Promise<ApiResponse<DbDeleteResponse>> {
    return this.request<DbDeleteResponse>('db/delete', {
      method: 'POST',
      body: params
    });
  }

  // LCP operations
  async getThreads(filters?: ThreadFilters): Promise<ApiResponse<{ data: any[] }>> {
    const body: any = { userId: this.currentUserId };
    if (filters) {
      Object.assign(body, filters);
    }
    
    return this.request<{ data: any[] }>('lcp/get_all_threads', {
      method: 'POST',
      body
    });
  }

  async getThreadById(conversationId: string): Promise<ApiResponse<Thread>> {
    return this.request<Thread>('lcp/getThreadById', {
      method: 'POST',
      body: { conversation_id: conversationId }
    });
  }

  async updateThread(conversationId: string, updates: ThreadUpdate): Promise<ApiResponse<Thread>> {
    return this.request<Thread>('lcp/update_thread', {
      method: 'POST',
      body: {
        conversation_id: conversationId,
        updates
      }
    });
  }

  async deleteThread(conversationId: string): Promise<ApiResponse<void>> {
    return this.request<void>('lcp/delete_thread', {
      method: 'POST',
      body: { conversation_id: conversationId }
    });
  }

  async markNotSpam(conversationId: string): Promise<ApiResponse<void>> {
    return this.request<void>('lcp/mark_not_spam', {
      method: 'POST',
      body: { conversation_id: conversationId }
    });
  }

  async sendEmail(emailRequest: LCPEmailRequest): Promise<ApiResponse<void>> {
    return this.request<void>('lcp/send_email', {
      method: 'POST',
      body: emailRequest
    });
  }

  async getLLMResponse(request: any): Promise<ApiResponse<any>> {
    return this.request<any>('lcp/get_llm_response', {
      method: 'POST',
      body: request
    });
  }

  // Authentication operations (no token required)
  async login(credentials: { email: string; password: string; provider?: string; name?: string; idToken?: string }): Promise<ApiResponse<any>> {
    return this.request<any>('auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  async signup(userData: any): Promise<ApiResponse<any>> {
    return this.request<any>('auth/signup', {
      method: 'POST',
      body: userData
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.request<void>('auth/logout', {
      method: 'POST'
    });
    
    // Clear local state on logout
    this.clearBackendToken();
    this.clearCache();
    
    return result;
  }

  // Utility operations
  async dbBatchSelect(queries: Array<{
    collection_name: string;
    key_name: string;
    key_value: string;
    filters?: Record<string, any>;
  }>): Promise<ApiResponse<any>> {
    return this.request<any>('db/batch-select', {
      method: 'POST',
      body: { queries }
    });
  }

  async submitContact(formData: any): Promise<ApiResponse<void>> {
    return this.request<void>('contact', {
      method: 'POST',
      body: formData
    });
  }

  async getUsageStats(): Promise<ApiResponse<any>> {
    return this.request<any>('usage/stats', {
      method: 'POST',
      body: { userId: this.currentUserId }
    });
  }

  async verifyDomain(domain: string): Promise<ApiResponse<any>> {
    return this.request<any>('domain/verify-identity', {
      method: 'POST',
      body: { domain }
    });
  }

  async verifyDKIM(domain: string): Promise<ApiResponse<any>> {
    return this.request<any>('domain/verify-dkim', {
      method: 'POST',
      body: { domain }
    });
  }

  async verifyEmailValidity(uid: string, email: string): Promise<ApiResponse<any>> {
    return this.request<any>('domain/verify-email-validity', {
      method: 'POST',
      body: { uid, email }
    });
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  clearCacheEntry(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((value, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Legacy methods for compatibility
  setAuthToken(token: string): void {
    this.setBackendToken(token);
  }

  removeAuthToken(): void {
    this.clearBackendToken();
  }

  getStorageStats() {
    return {
      cacheSize: this.cache.size,
      hasBackendToken: !!this.backendToken,
      currentUserId: this.currentUserId
    };
  }

  async refreshConversations(): Promise<ApiResponse<{ data: any[] }>> {
    this.clearCacheEntry('get_all_threads');
    return this.getThreads();
  }
}

// Server-side API client (for NextAuth callbacks)
export class ServerApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // Use the centralized config API URL for server-side requests
    const { config } = require('@/lib/config/local-api-config');
    this.baseURL = config.API_URL || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/${endpoint}`;
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        return {
          success: false,
          error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          data: undefined
        };
      }

      return {
        success: true,
        data: data,
        status: response.status
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        status: 0,
        data: undefined
      };
    }
  }

  async login(credentials: { email: string; password: string; provider?: string; name?: string; idToken?: string }): Promise<ApiResponse<any>> {
    return this.request<any>('login', {
      method: 'POST',
      body: credentials
    });
  }

  async signup(userData: any): Promise<ApiResponse<any>> {
    return this.request<any>('signup', {
      method: 'POST',
      body: userData
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export const serverApiClient = new ServerApiClient();