import { useMemo, useEffect, useRef } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { Conversation, Message, Thread } from '@/types/conversation';
import { ensureLocalDate, safeParseDate, compareDates } from '@/lib/utils/date';

/**
 * Calculates the AI score for a conversation based on its messages.
 */
function getAiScore(messages: Message[]): number | null {
    const messageWithScore = messages.find(msg => msg.ev_score !== undefined && msg.ev_score !== null);
    if (messageWithScore && typeof messageWithScore.ev_score === 'number') {
        return messageWithScore.ev_score;
    }
    return null;
}

/**
 * Processes the raw API response into a structured Conversation array.
 * This is the centralized data processing function that ensures all messages
 * have proper Date objects and consistent formatting.
 * 
 * IMPORTANT: This function centralizes all data transformation logic including:
 * - Field name mapping from database to frontend expectations
 * - Date parsing and validation
 * - Message processing and sorting
 * - Type safety and validation
 * - Proper lastMessageAt calculation from actual message timestamps
 * 
 * Database field mapping:
 * - source_name → lead_name (contact name)
 * - source → client_email (contact email)
 * - Additional fallbacks for various field name variations
 */
export function processThreadsResponse(responseData: any[]): Conversation[] {
  console.log('[api.ts] processThreadsResponse called with:', {
    dataType: typeof responseData,
    isArray: Array.isArray(responseData),
    length: responseData?.length,
    sampleItem: responseData?.[0]
  });

  if (!Array.isArray(responseData)) {
    console.warn('processThreadsResponse received non-array data:', responseData);
    return [];
  }

  const processedConversations = responseData
    .map((item: any): Conversation | null => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid thread item:', item);
        return null;
      }

      const rawThread = item.thread || item;
      if (!rawThread || typeof rawThread !== 'object') {
        console.warn('Invalid thread data:', rawThread);
        return null;
      }
      
      const conversationId = rawThread.conversation_id || rawThread.id || '';

      console.log('[api.ts] Processing thread:', {
        conversation_id: conversationId,
        rawThreadKeys: Object.keys(rawThread),
        createdAt: rawThread.createdAt,
        created_at: rawThread.created_at,
        last_updated: rawThread.last_updated,
        messagesCount: item.messages?.length || 0
      });

      // Process all messages with proper date handling
      const messages: Message[] = (item.messages || []).map((msg: any) => 
        processMessage(msg, conversationId)
      );

      // Calculate the actual last message timestamp from processed messages
      const sortedMessages = messages.sort((a, b) => compareDates(a.localDate, b.localDate, false));
      const mostRecentMessage = sortedMessages[0];
      const actualLastMessageAt = mostRecentMessage?.timestamp || rawThread.lastMessageAt || rawThread.last_updated || new Date().toISOString();
      
      const thread: Thread = {
        id: conversationId,
        conversation_id: conversationId,
        associated_account: rawThread.associated_account || '',
        createdAt: rawThread.createdAt || rawThread.created_at || rawThread.last_updated || new Date().toISOString(),
        updatedAt: rawThread.updatedAt || rawThread.updated_at || rawThread.last_updated || new Date().toISOString(),
        lastMessageAt: actualLastMessageAt, // Use calculated timestamp from most recent message
        // Centralized field mapping: Map database field names to expected frontend field names
        // Database uses 'source_name' for contact name and 'source' for email
        lead_name: rawThread.lead_name || rawThread.source_name || rawThread.name || rawThread.client_name || rawThread.sender_name || 'Unknown Lead',
        client_email: rawThread.client_email || rawThread.source || rawThread.email || rawThread.sender_email || rawThread.lead_email || '',
        phone: rawThread.phone || rawThread.phone_number || rawThread.contact_phone || '',
        location: rawThread.location || rawThread.address || rawThread.city || rawThread.area || '',
        source_name: rawThread.source_name || rawThread.source || rawThread.channel || '',
        ai_summary: rawThread.ai_summary || rawThread.summary || '',
        lcp_enabled: rawThread.lcp_enabled === true,
        lcp_flag_threshold: rawThread.lcp_flag_threshold,
        flag: rawThread.flag === true,
        flag_for_review: rawThread.flag_for_review === true,
        flag_review_override: rawThread.flag_review_override === true,
        spam: rawThread.spam === true,
        busy: rawThread.busy === true,
        read: rawThread.read === true,
        completed: rawThread.completed === true,
        budget_range: rawThread.budget_range || rawThread.budget || '',
        timeline: rawThread.timeline || rawThread.timeframe || '',
        preferred_property_types: rawThread.preferred_property_types || rawThread.property_types || '',
        priority: rawThread.priority || 'normal',
        subject: rawThread.subject || '',
        aiScore: getAiScore(messages),
      };

      console.log('[api.ts] Processed thread:', {
        conversation_id: thread.conversation_id,
        createdAt: thread.createdAt,
        createdAtType: typeof thread.createdAt,
        messagesCount: messages.length
      });

      const conversation = { thread, messages };
      
      return conversation;
    })
    .filter((conv): conv is Conversation => conv !== null);

  // Sort conversations by lastMessageAt in descending order (most recent first)
  // This ensures consistent ordering across all components that use this data
  return processedConversations.sort((a, b) => {
    const timeA = new Date(a.thread.lastMessageAt).getTime();
    const timeB = new Date(b.thread.lastMessageAt).getTime();
    return timeB - timeA; // Descending order (newest first)
  });
}

// Global state to prevent multiple simultaneous email checks
let globalEmailCheckInProgress = false;
let globalLastEmailCheckTime = 0;
const GLOBAL_DEBOUNCE_TIME = 2000; // 2 seconds debounce

/**
 * Shared email checking utility to prevent duplicate database calls
 */
export async function checkForNewEmailsShared(userId: string, onNewEmail?: () => Promise<void>) {
  // Global check to prevent multiple simultaneous checks across hooks
  if (globalEmailCheckInProgress) {
    console.log('Global email check already in progress, skipping...');
    return;
  }

  // Global debounce check
  const now = Date.now();
  if (now - globalLastEmailCheckTime < GLOBAL_DEBOUNCE_TIME) {
    console.log('Global debouncing email check, too soon since last check...');
    return;
  }

  globalEmailCheckInProgress = true;
  globalLastEmailCheckTime = now;

  try {
    console.log('Checking for new emails...');
    const response = await fetch('/api/db/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_name: 'Users',
        index_name: 'id-index',
        key_name: 'id',
        key_value: userId,
        account_id: userId
      }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.items?.[0]?.new_email === true) {
        console.log('New email detected, refreshing conversations...');
        
        // Call the callback if provided
        if (onNewEmail) {
          await onNewEmail();
        }
        
        // Reset new_email flag
        await fetch('/api/db/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table_name: 'Users',
            index_name: 'id-index',
            key_name: 'id',
            key_value: userId,
            update_data: { new_email: false },
            account_id: userId
          }),
          credentials: 'include',
        });
      } else {
        console.log('No new emails found');
      }
    }
  } catch (err) {
    console.error('Error checking for new emails:', err);
  } finally {
    globalEmailCheckInProgress = false;
  }
}

/**
 * Enhanced hook for fetching and processing all conversation threads.
 */
export function useThreadsApi(options: any = {}) {
  const { data: session } = useSession() as { data: (Session & { user: { id: string } }) | null };
  
  const { data: rawData, loading, error, refetch, mutate } = useApi<any>('lcp/get_all_threads', {
    method: 'POST',
    body: { userId: session?.user?.id },
    enabled: options.enabled !== false && !!session?.user?.id,
    ...options
  });

  const processedData = useMemo(() => {
    const threadsArray = rawData?.data || [];
    return processThreadsResponse(threadsArray);
  }, [rawData]);

  // Polling logic for new emails
  useEffect(() => {
    if (!options.polling || !session?.user?.id) return;

    // Check for new emails when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, checking for new emails...');
        checkForNewEmailsShared(session.user.id, refetch);
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [options.polling, session?.user?.id, refetch]);

  return {
    data: processedData,
    loading,
    error,
    refetch,
    mutate,
  };
}

/**
 * Hook to get a specific conversation by ID.
 */
export function useConversationById(conversationId: string, options: any = {}) {
  const { data: conversations, loading, error, refetch } = useThreadsApi({
    ...options,
    polling: true // Enable polling for real-time updates
  });

  const conversation = useMemo(() => {
    if (!conversations || !conversationId) return null;
    return conversations.find(conv => conv.thread.conversation_id === conversationId) || null;
  }, [conversations, conversationId]);

  return {
    conversation,
    loading,
    error,
    refetch,
  };
}

/**
 * Processes a raw message object into a properly formatted Message
 */
function processMessage(msg: any, conversationId: string): Message {
  const timestamp = msg.timestamp || new Date().toISOString();
  const localDate = safeParseDate(timestamp);
  
  // Determine sender and recipient information
  const sender = msg.sender || msg.sender_email || msg.from || '';
  const recipient = msg.recipient || msg.receiver || msg.to || msg.receiver_email || '';
  const senderName = msg.sender_name || msg.from_name || sender.split('@')[0] || 'Unknown';
  
  return {
    id: msg.id || msg.response_id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversation_id: msg.conversation_id || conversationId,
    response_id: msg.response_id,
    sender_name: senderName,
    sender_email: sender,
    sender: sender,
    recipient: recipient,
    receiver: recipient,
    body: msg.body || msg.content || '',
    content: msg.content || msg.body || '',
    subject: msg.subject || '',
    timestamp: timestamp,
    localDate: localDate, // Always a valid Date object
    type: msg.type || 'inbound-email',
    read: msg.read === true,
    ev_score: typeof msg.ev_score === 'string' ? parseFloat(msg.ev_score) : msg.ev_score,
    associated_account: msg.associated_account || msg.sender,
    in_reply_to: msg.in_reply_to || null,
    is_first_email: msg.is_first_email === true,
    metadata: msg.metadata || {},
  };
} 