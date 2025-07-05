/**
 * File: app/dashboard/lib/dashboard-client.ts
 * Purpose: Client-side dashboard functionality including React hooks and utilities
 * Author: Gemini
 * Date: 06/13/25
 * Version: 1.0.0
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import type { Thread, Message, Conversation } from '@/types/conversation';
import { goto404 } from '@/app/utils/error';
import { 
    ensureMessageFields, 
    getLatestEvaluableMessage, 
    calculateMetrics, 
    processThreadData,
    ThreadMetrics,
    TimeRange,
    MessageWithResponseId,
    LeadPerformanceData
} from '@/app/dashboard/lib/dashboard-utils';
import { apiClient } from '@/lib/api/client';

// Define local DashboardFilters type to match the server-side definition
interface DashboardFilters {
    unread: boolean;
    review: boolean;
    completion: boolean;
}

export const useDashboard = () => {
    const { data: session, status } = useSession() as { data: Session & { user: { id: string } } | null, status: string };
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [updatingLcp, setUpdatingLcp] = useState<string | null>(null);
    const [updatingRead, setUpdatingRead] = useState<string | null>(null);
    const [deletingThread, setDeletingThread] = useState<string | null>(null);
    const [updatingSpam, setUpdatingSpam] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
    const [showFunnel, setShowFunnel] = useState(false);
    const [showProgression, setShowProgression] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('year');
    const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
    const [leadPerformanceData, setLeadPerformanceData] = useState<LeadPerformanceData[]>([]);
    const [loadingLeadPerformance, setLoadingLeadPerformance] = useState(false);
    const [refreshingLeadPerformance, setRefreshingLeadPerformance] = useState(false);
    const [filters, setFilters] = useState<DashboardFilters>({
        unread: false,
        review: false,
        completion: false,
    });

    // Load threads - primarily used for manual refresh button
    const loadThreads = useCallback(async () => {
        if (!session?.user?.id || loadingConversations) {
            return;
        }
        setLoadingConversations(true);
        setLoadingLeadPerformance(true);
        try {
            const response = await apiClient.request('/lcp/get_all_threads', {
                method: 'POST',
                body: { userId: session.user.id },
            });
            
            if (!response.success || !response.data) {
                throw new Error('Invalid response format from API');
            }
            
            // Ensure response.data is an array
            const rawData = Array.isArray(response.data) ? response.data : [];
            const { conversations, leadPerformance } = processThreadData(rawData, timeRange);
            // log conversations
            setConversations(conversations);
            setLeadPerformanceData(leadPerformance);
        } catch (error) {
            console.error('[Dashboard] Error fetching threads:', error);
            setConversations([]);
            setLeadPerformanceData([]);
        } finally {
            setLoadingConversations(false);
            setLoadingLeadPerformance(false);
        }
    }, [session?.user?.id, timeRange]);

    const markAsRead = useCallback(async (conversationId: string) => {
        if (!session?.user?.id) return;
        setUpdatingRead(conversationId);
        try {
            const response = await apiClient.dbUpdate({
                table_name: 'Threads',
                index_name: 'conversation_id-index',
                key_name: 'conversation_id',
                key_value: conversationId,
                update_data: { read: 'true' }
            });
            
            if (!response.success) throw new Error('Failed to mark as read');
            
            // Update local state instead of reloading
            setConversations(prev => prev.map(conv => 
                conv.thread.conversation_id === conversationId 
                    ? { ...conv, thread: { ...conv.thread, read: true } }
                    : conv
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        } finally {
            setUpdatingRead(null);
        }
    }, [session?.user?.id]);

    const toggleLeadConversion = useCallback(async (conversationId: string) => {
        if (!session?.user?.id) return;
        const currentStatus = conversations.find(c => c.thread.conversation_id === conversationId)?.thread.lcp_enabled || false;
        setUpdatingLcp(conversationId);
        try {
            const response = await apiClient.dbUpdate({
                table_name: 'Threads',
                index_name: 'conversation_id-index',
                key_name: 'conversation_id',
                key_value: conversationId,
                update_data: { lcp_enabled: (!currentStatus).toString() }
            });
            
            if (!response.success) throw new Error('Failed to update LCP status');
            
            // Update local state instead of reloading
            setConversations(prev => prev.map(conv => 
                conv.thread.conversation_id === conversationId 
                    ? { ...conv, thread: { ...conv.thread, lcp_enabled: !currentStatus } }
                    : conv
            ));
        } catch (error) {
            console.error('Error updating LCP status:', error);
        } finally {
            setUpdatingLcp(null);
        }
    }, [session?.user?.id]);

    const deleteThread = useCallback(async (conversationId: string) => {
        if (!session?.user?.id) return;
        setDeletingThread(conversationId);
        try {
            const response = await apiClient.deleteThread(conversationId);
            
            if (!response.success) throw new Error('Failed to delete thread');
            
            // Update local state instead of reloading
            setConversations(prev => prev.filter(conv => conv.thread.conversation_id !== conversationId));
        } catch (error) {
            console.error('Error deleting thread:', error);
        } finally {
            setDeletingThread(null);
        }
    }, [session?.user?.id]);

    const handleMarkAsNotSpam = async (conversationId: string) => {
        setUpdatingSpam(conversationId);
        try {
            const response = await apiClient.markNotSpam(conversationId);
            
            if (!response.success) throw new Error('Failed to mark as not spam');
            
            // Update local state instead of reloading
            setConversations(prev => prev.map(conv => 
                conv.thread.conversation_id === conversationId 
                    ? { ...conv, thread: { ...conv.thread, spam: false } }
                    : conv
            ));
        } catch (error) {
            console.error('Error marking as not spam:', error);
        } finally {
            setUpdatingSpam(null);
        }
    };

    const confirmDelete = useCallback(() => {
        if (threadToDelete) {
            deleteThread(threadToDelete);
            setDeleteModalOpen(false);
            setThreadToDelete(null);
        }
    }, [threadToDelete, deleteThread]);

    const refreshLeadPerformance = useCallback(async () => {
        if (!session?.user?.id) return;
        setRefreshingLeadPerformance(true);
        try {
            const response = await apiClient.request('/lcp/get_all_threads', {
                method: 'POST',
                body: { userId: session.user.id },
            });
            if (!response.success || !response.data) {
                throw new Error('Failed to refresh lead performance');
            }
            
            // Ensure response.data is an array
            const rawData = Array.isArray(response.data) ? response.data : [];
            const { leadPerformance } = processThreadData(rawData, timeRange);
            setLeadPerformanceData(leadPerformance);
        } catch (error) {
            console.error('Error refreshing lead performance:', error);
        } finally {
            setRefreshingLeadPerformance(false);
        }
    }, [session]);

    const toggleFilter = (filter: keyof DashboardFilters) => {
        setFilters((prev: DashboardFilters) => ({ ...prev, [filter]: !prev[filter] }));
    };

    // Helper function to check if a thread is completed
    const isThreadCompleted = (completed: boolean | string | undefined): boolean => {
        if (typeof completed === 'boolean') return completed;
        if (typeof completed === 'string') return completed.toLowerCase() === 'true';
        return false;
    };

    // Memoize filtered conversations to prevent recalculation on every render
    const filteredConversations = useMemo(() => {
        const filtered = conversations.filter(conv => {
            if (conv.thread.spam) return false;
            if (isThreadCompleted(conv.thread.completed)) {
                return false;
            }
            if (filters.unread && !conv.thread.read) return true;
            if (filters.review && conv.thread.flag_for_review) return true;
            if (filters.completion) {
                const evMessage = getLatestEvaluableMessage(conv.messages);
                return (evMessage?.ev_score ?? 0) > (conv.thread.lcp_flag_threshold ?? 70) && !conv.thread.flag_for_review;
            }
            return !filters.unread && !filters.review && !filters.completion;
        });
        
        
        return filtered;
    }, [conversations, filters]);

    // Memoize metrics to prevent recalculation on every render
    const metrics = useMemo(() => {
        return calculateMetrics(conversations, timeRange);
    }, [conversations, timeRange]);

    return {
        session,
        status,
        conversations,
        loadingConversations,
        updatingLcp,
        updatingRead,
        deletingThread,
        updatingSpam,
        deleteModalOpen,
        threadToDelete,
        showFunnel,
        showProgression,
        timeRange,
        showTimeRangeDropdown,
        leadPerformanceData,
        loadingLeadPerformance,
        refreshingLeadPerformance,
        filters,
        metrics,
        filteredConversations,
        setDeleteModalOpen,
        setThreadToDelete,
        setShowFunnel,
        setShowProgression,
        setTimeRange,
        setShowTimeRangeDropdown,
        toggleFilter,
        loadThreads,
        handleMarkAsRead: markAsRead,
        handleLcpToggle: toggleLeadConversion,
        handleDeleteThread: deleteThread,
        confirmDelete,
        handleMarkAsNotSpam,
        refreshLeadPerformance,
    };
}; 