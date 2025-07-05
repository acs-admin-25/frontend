/**
 * File: app/dashboard/lib/dashboard-utils.ts
 * Purpose: Shared utility functions for dashboard functionality
 * Author: Gemini
 * Date: 07/19/2024
 * Version: 3.0.0
 */

import type { 
    Thread, 
    Message,
    Conversation
} from '@/types/conversation';
import { formatLocalDate, formatLocalTime } from '@/app/utils/timezone';
import { 
  sortMessagesByDate, 
  getMostRecentMessage, 
  getLatestEvaluableMessage as getLatestEvaluableMessageUtil
} from '@/lib/utils/conversation';
import { processThreadsResponse } from '@/lib/utils/api';
import { ensureLocalDate, compareDates, getSafeTime } from '@/lib/utils/date';

// Define local types for dashboard functionality
export interface ThreadMetrics {
    newLeads: number;
    pendingReplies: number;
    unopenedLeads: number;
}

export interface MessageWithResponseId extends Message {
    response_id: string;
}

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface LeadPerformanceData {
    threadId: string;
    score: number;
    timestamp: string;
    startTimestamp: string;
    endTimestamp: string;
    source: string;
    sourceName: string;
}

// Define a type for the processed thread that matches our Thread type
type ProcessedThread = {
    conversation_id: string;
    associated_account: string;
    name: string;
    flag_for_review: boolean;
    flag_review_override: boolean;
    read: boolean;
    busy: boolean;
    spam: boolean;
    lcp_enabled: boolean;
    lcp_flag_threshold: number;
    messages: Message[];
    ai_summary: string;
    source: string;
    source_name: string;
    budget_range: string;
    preferred_property_types: string;
    timeline: string;
    last_updated: string;
    created_at: string;
    updated_at: string;
    flag: boolean;
    completed?: boolean;
};

// Utility function to parse boolean values from both string and boolean types
export const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value !== 0;
    return false;
};

export const ensureMessageFields = (msg: any): Message => ({
    id: msg.id || msg.conversation_id,
    conversation_id: msg.conversation_id,
    response_id: msg.response_id,
    type: msg.type as any,
    content: msg.content || msg.body || '',
    body: msg.body || msg.content || '',
    subject: msg.subject || '',
    timestamp: msg.timestamp,
    localDate: formatLocalTime(msg.timestamp, undefined, msg.type as 'inbound-email' | 'outbound-email'),
    sender_name: msg.sender_name || msg.sender || '',
    sender_email: msg.sender_email || msg.sender || '',
    sender: msg.sender,
    recipient: msg.recipient || msg.receiver,
    receiver: msg.receiver || msg.recipient,
    associated_account: msg.associated_account || msg.sender,
    ev_score: typeof msg.ev_score === 'string' ? parseFloat(msg.ev_score) : msg.ev_score,
    in_reply_to: msg.in_reply_to || null,
    is_first_email: parseBoolean(msg.is_first_email),
    metadata: msg.metadata || {},
    read: parseBoolean(msg.read),
});

export const getLatestEvaluableMessage = (messages: Message[]): MessageWithResponseId | undefined => {
    if (!messages?.length) return undefined;
    return messages
        .filter((msg): msg is MessageWithResponseId => Boolean(msg.response_id))
        .sort((a, b) => compareDates(a.localDate, b.localDate, false))[0];
};

export const calculateMetrics = (conversations: any[], timeRange: TimeRange): ThreadMetrics => {
    if (!conversations.length) return { newLeads: 0, pendingReplies: 0, unopenedLeads: 0 };

    const now = new Date();
    const startDate = getStartDate(timeRange, now);

    // Exclude spam and completed threads from metrics
    const nonSpamNonCompletedThreads = conversations.filter(conversation => {
        const thread = conversation.thread || conversation;
        return !thread.spam && !thread.completed;
    });

    return nonSpamNonCompletedThreads.reduce((metrics, conversation) => {
        const thread = conversation.thread || conversation;
        const latestMessage = getMostRecentMessage(conversation);

        if (!thread.read) metrics.unopenedLeads++;
        if (latestMessage?.type === 'inbound-email') metrics.pendingReplies++;
        
        // Ensure localDate is a valid Date object
        if (latestMessage) {
            const messageDate = ensureLocalDate(latestMessage.localDate);
            if (messageDate >= startDate) {
                metrics.newLeads++;
            }
        }

        return metrics;
    }, { newLeads: 0, pendingReplies: 0, unopenedLeads: 0 });
};

const getStartDate = (timeRange: TimeRange, now: Date): Date => {
    const startDate = new Date(now);
    switch (timeRange) {
        case 'today': startDate.setHours(0, 0, 0, 0); break;
        case 'week': startDate.setDate(now.getDate() - 7); break;
        case 'month': startDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(Math.floor(now.getMonth() / 3) * 3); break;
        case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
        case 'all': startDate.setTime(0); break;
    }
    return startDate;
};

export const processThreadData = (rawData: any[], timeRange: TimeRange) => {
    if (!Array.isArray(rawData)) {
        console.warn('processThreadData received non-array data:', rawData);
        return { conversations: [], metrics: { newLeads: 0, pendingReplies: 0, unopenedLeads: 0 }, leadPerformance: [] };
    }

    // Use centralized processing to ensure consistent Conversation objects
    const conversations = processThreadsResponse(rawData);
    
    // Sort conversations by most recent message
    const sortedConversations = [...conversations].sort((a, b) => {
        const aLatest = getMostRecentMessage(a);
        const bLatest = getMostRecentMessage(b);
        
        // Ensure localDate is a valid Date object
        const aTime = aLatest ? getSafeTime(aLatest.localDate) : 0;
        const bTime = bLatest ? getSafeTime(bLatest.localDate) : 0;
        
        return bTime - aTime;
    });

    const metrics = calculateMetrics(sortedConversations, timeRange);
    
    const leadPerformance = sortedConversations
        .filter(conversation => conversation.messages?.[0])
        .map(conversation => {
            const messages = conversation.messages || [];
            const evMessage = getLatestEvaluableMessage(messages);
            const sortedMessages = sortMessagesByDate(messages, true);
            const firstMessage = sortedMessages[0];
            const lastMessage = sortedMessages[sortedMessages.length - 1];

            return {
                threadId: conversation.thread.conversation_id,
                score: evMessage?.ev_score || 0,
                timestamp: evMessage?.timestamp || new Date().toISOString(),
                startTimestamp: firstMessage?.timestamp || new Date().toISOString(),
                endTimestamp: lastMessage?.timestamp || new Date().toISOString(),
                source: conversation.thread.source_name || '',
                sourceName: conversation.thread.source_name || '',
            };
        });

    return { 
        conversations: sortedConversations, 
        metrics, 
        leadPerformance 
    };
};

// Helper function to check if a thread is completed
export const isThreadCompleted = (completed: boolean | string | undefined): boolean => {
    return parseBoolean(completed);
};

/**
 * Ensures all messages in a conversation have proper localDate fields
 * This should be called whenever raw message data is received
 */
export const ensureMessageLocalDates = (messages: any[]): Message[] => {
  if (!Array.isArray(messages)) return [];
  
  return messages.map(msg => {
    if (msg.localDate instanceof Date) {
      // Already processed, return as is
      return msg as Message;
    }
    
    // Process the message to ensure it has localDate
    return ensureMessageFields(msg);
  });
}; 