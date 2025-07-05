/**
 * File: app/dashboard/lib/dashboard.ts
 * Purpose: Server-side dashboard functionality including server actions
 * Author: Gemini
 * Date: 07/19/2024
 * Version: 3.0.0
 */
'use server';

import { revalidatePath } from 'next/cache';
import type { Conversation, Thread } from '@/types/conversation';
import { processThreadData, getLatestEvaluableMessage } from './dashboard-utils';

// Define local types for dashboard functionality
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface DashboardFilters {
  unread: boolean;
  review: boolean;
  completion: boolean;
}

export interface ThreadOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const REQUEST_THROTTLE = 1000; // 1 second

class DashboardServerApi {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private lastRequestTime = 0;
    private pendingRequests = new Map<string, Promise<any>>();

    private async request<T>(
        endpoint: string,
        method: string = 'GET',
        body?: any,
        tags?: string[]
    ): Promise<T> {
        const now = Date.now();
        if (now - this.lastRequestTime < REQUEST_THROTTLE) {
            await new Promise(resolve => setTimeout(resolve, REQUEST_THROTTLE));
        }
        this.lastRequestTime = now;

        const cacheKey = `${method}:${endpoint}:${JSON.stringify(body)}`;
        const cached = this.cache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey)!;
        }

        const url = `api/${endpoint}`;
        const requestPromise = fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            next: { tags },
            credentials: 'include',
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: now });
            return data;
        });

        this.pendingRequests.set(cacheKey, requestPromise);
        try {
            return await requestPromise;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    async getAllThreads(userId: string) {
        return this.request<ThreadOperationResult>('lcp/get_all_threads', 'POST', { userId }, ['threads']);
    }

    async updateThread(conversationId: string, updates: Partial<Thread>) {
        // Use db/update instead of the non-existent lcp/update_thread endpoint
        const dbUpdateParams = {
            table_name: 'Threads',
            index_name: 'conversation_id-index',
            key_name: 'conversation_id',
            key_value: conversationId,
            update_data: updates
        };
        return this.request<ThreadOperationResult>('db/update', 'POST', dbUpdateParams, ['threads']);
    }

    async deleteThread(conversationId: string) {
        return this.request<ThreadOperationResult>('lcp/delete_thread', 'POST', { conversation_id: conversationId }, ['threads']);
    }

    clearCache() {
        this.cache.clear();
    }
}

const dashboardServerApi = new DashboardServerApi();

// Server Actions
export async function getDashboardData(userId: string, timeRange: TimeRange, filters: DashboardFilters) {
    try {
        const result = await dashboardServerApi.getAllThreads(userId);
        if (!result.success || !Array.isArray(result.data)) {
            throw new Error('Invalid response format');
        }

        const { conversations, metrics, leadPerformance } = processThreadData(result.data, timeRange);
        const filterCounts = {
            unread: conversations.filter((conv: Conversation) => !conv.thread.read).length,
            review: conversations.filter((conv: Conversation) => conv.thread.flag_for_review).length,
            completion: conversations.filter((conv: Conversation) => {
                const evMessage = getLatestEvaluableMessage(conv.messages);
                const threshold = conv.thread.lcp_flag_threshold ?? 70; // Default threshold
                return (evMessage?.ev_score ?? 0) > threshold && !conv.thread.flag_for_review;
            }).length,
        };

        const filteredConversations = conversations.filter((conv: Conversation) => {
            if (conv.thread.spam) return false;
            if (filters.unread && !conv.thread.read) return true;
            if (filters.review && conv.thread.flag_for_review) return true;
            if (filters.completion) {
                const evMessage = getLatestEvaluableMessage(conv.messages);
                const threshold = conv.thread.lcp_flag_threshold ?? 70; // Default threshold
                return (evMessage?.ev_score ?? 0) > threshold && !conv.thread.flag_for_review;
            }
            return !filters.unread && !filters.review && !filters.completion;
        });

        return { 
            conversations: filteredConversations, 
            metrics, 
            filterCounts, 
            leadPerformance 
        };
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        throw error;
    }
}

export async function updateThreadAction(conversationId: string, updates: Partial<Thread>) {
    try {
        await dashboardServerApi.updateThread(conversationId, updates);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating thread:', error);
        return { success: false, error };
    }
}

export async function deleteThreadAction(conversationId: string) {
    try {
        await dashboardServerApi.deleteThread(conversationId);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting thread:', error);
        return { success: false, error };
    }
} 