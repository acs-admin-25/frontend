/**
 * File: lib/utils/conversations.ts
 * Purpose: Centralized conversation data processing, filtering, and sorting utilities
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.1.0
 */

import { format, isToday, isYesterday, differenceInHours, differenceInDays } from 'date-fns';
import type { Conversation, Message, Thread } from '@/types/conversation';

export interface ProcessedConversation extends Conversation {
  evScore: number | null;
  status: ConversationStatus;
  lastActivity: string;
  isSelected?: boolean;
}

export type ConversationStatus = 'active' | 'pending' | 'completed' | 'flagged' | 'spam';
export type SortField = 'date' | 'name' | 'evScore' | 'status' | 'lastMessage';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface ConversationFilters {
  status: ConversationStatus[];
  evScoreRange: [number, number];
  dateRange: [Date | null, Date | null];
  searchQuery: string;
  showPendingOnly: boolean;
}

/**
 * Calculate EV score from conversation messages
 */
export function calculateEVScore(messages: Message[]): number | null {
  const messagesWithScore = messages.filter(msg => 
    msg.ev_score !== undefined && 
    msg.ev_score !== null && 
    !isNaN(Number(msg.ev_score))
  );
  
  if (messagesWithScore.length === 0) return null;
  
  const scores = messagesWithScore.map(msg => Number(msg.ev_score));
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  return Math.round(averageScore * 100) / 100;
}

/**
 * Determine conversation status based on thread properties
 */
export function determineStatus(thread: Thread): ConversationStatus {
  if (thread.spam) return 'spam';
  if (thread.flag || thread.flag_for_review) return 'flagged';
  if (thread.completed) return 'completed';
  if (thread.busy) return 'pending';
  return 'active';
}

/**
 * Format last activity time for display
 */
export function formatLastActivity(lastMessageAt: string): string {
  const date = new Date(lastMessageAt);
  const now = new Date();
  
  if (isToday(date)) {
    const hours = differenceInHours(now, date);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  const days = differenceInDays(now, date);
  if (days < 7) return `${days}d ago`;
  
  return format(date, 'MMM d, yyyy');
}

/**
 * Process raw conversation data into enhanced format
 */
export function processConversationsData(conversations: Conversation[]): ProcessedConversation[] {
  return conversations.map(conversation => ({
    ...conversation,
    evScore: calculateEVScore(conversation.messages),
    status: determineStatus(conversation.thread),
    lastActivity: formatLastActivity(conversation.thread.lastMessageAt),
    isSelected: false
  }));
}

/**
 * Filter conversations based on criteria
 */
export function filterConversations(
  conversations: ProcessedConversation[],
  filters: ConversationFilters
): ProcessedConversation[] {
  return conversations.filter(conversation => {
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(conversation.status)) {
      return false;
    }
    
    // EV Score range filter
    if (conversation.evScore !== null) {
      const [min, max] = filters.evScoreRange;
      if (conversation.evScore < min || conversation.evScore > max) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange[0] || filters.dateRange[1]) {
      const lastMessageDate = new Date(conversation.thread.lastMessageAt);
      if (filters.dateRange[0] && lastMessageDate < filters.dateRange[0]) {
        return false;
      }
      if (filters.dateRange[1] && lastMessageDate > filters.dateRange[1]) {
        return false;
      }
    }
    
    // Pending only filter
    if (filters.showPendingOnly && conversation.status !== 'pending') {
      return false;
    }
    
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        conversation.thread.lead_name || '',
        conversation.thread.client_email || '',
        conversation.thread.location || '',
        conversation.thread.ai_summary || '',
        ...conversation.messages.map(msg => msg.body || '')
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort conversations based on configuration
 */
export function sortConversations(
  conversations: ProcessedConversation[],
  sortConfig: SortConfig
): ProcessedConversation[] {
  const sorted = [...conversations];
  
  sorted.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortConfig.field) {
      case 'date':
      case 'lastMessage':
        aValue = new Date(a.thread.lastMessageAt).getTime();
        bValue = new Date(b.thread.lastMessageAt).getTime();
        break;
      case 'name':
        aValue = (a.thread.lead_name || '').toLowerCase();
        bValue = (b.thread.lead_name || '').toLowerCase();
        break;
      case 'evScore':
        aValue = a.evScore ?? 0;
        bValue = b.evScore ?? 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: ConversationStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'flagged':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'spam':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get EV score color based on value
 */
export function getEVScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

/**
 * Calculate conversation metrics for dashboard
 */
export function calculateConversationMetrics(conversations: ProcessedConversation[]) {
  const total = conversations.length;
  const active = conversations.filter(c => c.status === 'active').length;
  const pending = conversations.filter(c => c.status === 'pending').length;
  const completed = conversations.filter(c => c.status === 'completed').length;
  const flagged = conversations.filter(c => c.status === 'flagged').length;
  const spam = conversations.filter(c => c.status === 'spam').length;
  
  const evScores = conversations
    .map(c => c.evScore)
    .filter(score => score !== null) as number[];
  
  const averageEVScore = evScores.length > 0 
    ? Math.round(evScores.reduce((sum, score) => sum + score, 0) / evScores.length * 100) / 100
    : 0;
  
  return {
    total,
    active,
    pending,
    completed,
    flagged,
    spam,
    averageEVScore
  };
} 