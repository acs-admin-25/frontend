/**
 * Centralized conversation utilities
 * All conversation data processing should go through these functions
 */

import type { Conversation, Message } from '@/types/conversation';
import { ensureLocalDate, compareDates } from '@/lib/utils/date';

/**
 * Sorts messages by timestamp in descending order (newest first)
 * Uses the guaranteed valid localDate field
 */
export function sortMessagesByDate(messages: Message[], ascending: boolean = false): Message[] {
  return [...messages].sort((a, b) => compareDates(a.localDate, b.localDate, ascending));
}

/**
 * Gets the most recent message from a conversation
 */
export function getMostRecentMessage(conversation: Conversation): Message | null {
  if (!conversation.messages || conversation.messages.length === 0) {
    return null;
  }
  
  const sortedMessages = sortMessagesByDate(conversation.messages);
  return sortedMessages[0];
}

/**
 * Gets the first message from a conversation (chronologically)
 */
export function getFirstMessage(conversation: Conversation): Message | null {
  if (!conversation.messages || conversation.messages.length === 0) {
    return null;
  }
  
  const sortedMessages = sortMessagesByDate(conversation.messages, true);
  return sortedMessages[0];
}

/**
 * Calculates the duration between first and last message
 */
export function getConversationDuration(conversation: Conversation): number {
  const firstMessage = getFirstMessage(conversation);
  const lastMessage = getMostRecentMessage(conversation);
  
  if (!firstMessage || !lastMessage) {
    return 0;
  }
  
  // Ensure localDate is a valid Date object
  const firstDate = ensureLocalDate(firstMessage.localDate);
  const lastDate = ensureLocalDate(lastMessage.localDate);
  
  return lastDate.getTime() - firstDate.getTime();
}

/**
 * Gets messages within a specific time range
 */
export function getMessagesInTimeRange(
  conversation: Conversation, 
  startDate: Date, 
  endDate: Date
): Message[] {
  return conversation.messages.filter(message => {
    // Ensure localDate is a valid Date object
    const messageDate = ensureLocalDate(message.localDate);
    const messageTime = messageDate.getTime();
    return messageTime >= startDate.getTime() && messageTime <= endDate.getTime();
  });
}

/**
 * Groups messages by date for display purposes
 * Messages are sorted chronologically (oldest first) within each date group
 * to ensure proper conversation flow in the UI
 */
export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  // First sort all messages by date (oldest first for conversation flow)
  const sortedMessages = sortMessagesByDate(messages, true);
  
  return sortedMessages.reduce((acc: Record<string, Message[]>, message) => {
    // Ensure localDate is a valid Date object
    const messageDate = ensureLocalDate(message.localDate);
    const date = messageDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});
}

/**
 * Gets the latest message with an EV score
 */
export function getLatestEvaluableMessage(conversation: Conversation): Message | null {
  const messagesWithScore = conversation.messages.filter(msg => 
    msg.ev_score !== undefined && msg.ev_score !== null && !isNaN(msg.ev_score)
  );
  
  if (messagesWithScore.length === 0) {
    return null;
  }
  
  const sortedMessages = sortMessagesByDate(messagesWithScore);
  return sortedMessages[0];
}

/**
 * Calculates average response time between messages
 */
export function getAverageResponseTime(conversation: Conversation): number {
  const sortedMessages = sortMessagesByDate(conversation.messages, true);
  
  if (sortedMessages.length < 2) {
    return 0;
  }
  
  let totalTimeDiff = 0;
  let validPairs = 0;
  
  for (let i = 1; i < sortedMessages.length; i++) {
    const currentMsg = sortedMessages[i];
    const previousMsg = sortedMessages[i - 1];
    
    // Ensure localDate is a valid Date object
    const currentDate = ensureLocalDate(currentMsg.localDate);
    const previousDate = ensureLocalDate(previousMsg.localDate);
    
    const timeDiff = currentDate.getTime() - previousDate.getTime();
    totalTimeDiff += timeDiff;
    validPairs++;
  }
  
  return validPairs > 0 ? totalTimeDiff / validPairs : 0;
}

/**
 * Gets conversation statistics
 */
export function getConversationStats(conversation: Conversation) {
  const messages = conversation.messages;
  const clientMessages = messages.filter(m => m.type === 'inbound-email').length;
  const userMessages = messages.filter(m => m.type === 'outbound-email').length;
  const duration = getConversationDuration(conversation);
  const avgResponseTime = getAverageResponseTime(conversation);
  const firstMessage = getFirstMessage(conversation);
  const lastMessage = getMostRecentMessage(conversation);
  
  return {
    totalMessages: messages.length,
    clientMessages,
    userMessages,
    duration,
    avgResponseTime,
    firstMessage: firstMessage?.timestamp || null,
    lastMessage: lastMessage?.timestamp || null,
    firstMessageType: firstMessage?.type || null,
    lastMessageType: lastMessage?.type || null,
  };
}

/**
 * Formats a duration in milliseconds to a human-readable string
 */
export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Gets the conversation title/name
 */
export function getConversationTitle(conversation: Conversation): string {
  return conversation.thread.lead_name || 
         conversation.thread.source_name || 
         conversation.thread.client_email || 
         'Unknown';
}

/**
 * Checks if a conversation is completed
 */
export function isConversationCompleted(conversation: Conversation): boolean {
  return conversation.thread.completed === true;
}

/**
 * Checks if a conversation is flagged for review
 */
export function isConversationFlaggedForReview(conversation: Conversation): boolean {
  return conversation.thread.flag_for_review === true;
}

/**
 * Checks if a conversation is busy
 */
export function isConversationBusy(conversation: Conversation): boolean {
  return conversation.thread.busy === true;
}

/**
 * Gets the conversation status for display
 */
export function getConversationStatus(conversation: Conversation): {
  status: 'completed' | 'review' | 'busy' | 'active';
  color: string;
  text: string;
} {
  if (isConversationCompleted(conversation)) {
    return {
      status: 'completed',
      color: 'bg-green-100 text-green-800',
      text: 'completed'
    };
  } else if (isConversationFlaggedForReview(conversation)) {
    return {
      status: 'review',
      color: 'bg-yellow-100 text-yellow-800',
      text: 'review'
    };
  } else if (isConversationBusy(conversation)) {
    return {
      status: 'busy',
      color: 'bg-red-100 text-red-800',
      text: 'busy'
    };
  } else {
    return {
      status: 'active',
      color: 'bg-blue-100 text-blue-800',
      text: 'active'
    };
  }
} 