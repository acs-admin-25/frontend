'use client';

import { useState, useMemo, useCallback } from 'react';
import { useThreadsApi } from '@/lib/utils/api';
import type { Conversation, Thread } from '@/types/conversation';

type SortField = 'aiScore' | 'date' | null;
type SortDirection = 'asc' | 'desc';

interface Filters {
  status: ('hot' | 'warm' | 'cold')[];
  aiScoreRange: [number, number];
  searchQuery: string;
}

function calculateStatus(score: number | null): "hot" | "warm" | "cold" {
  if (score === null || isNaN(score)) return "cold";
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  return "cold";
}

export function useConversations() {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Filters>({
    status: ["hot", "warm", "cold"],
    aiScoreRange: [0, 100],
    searchQuery: '',
  });

  const { data: conversations, loading, error, refetch } = useThreadsApi({
    enabled: true,
    polling: true,
  });

  const filteredAndSortedConversations = useMemo(() => {
    if (!conversations) return [];

    return conversations
      .filter(conversation => {
        const thread = conversation.thread;
        // Search filter
        if (filters.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          const matchesSearch =
            thread.conversation_id.toLowerCase().includes(searchLower) ||
            thread.lead_name?.toLowerCase().includes(searchLower) ||
            thread.client_email?.toLowerCase().includes(searchLower) ||
            conversation.messages.some(msg =>
              (msg.body || '').toLowerCase().includes(searchLower)
            );
          if (!matchesSearch) return false;
        }

        // Status filter
        const status = calculateStatus(thread.aiScore);
        if (!filters.status.includes(status)) return false;

        // AI Score range filter
        if (thread.aiScore !== null && (thread.aiScore < filters.aiScoreRange[0] || thread.aiScore > filters.aiScoreRange[1])) {
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (!sortField) return 0;

        if (sortField === 'date') {
          const dateA = new Date(a.thread.lastMessageAt).getTime();
          const dateB = new Date(b.thread.lastMessageAt).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }

        if (sortField === 'aiScore') {
          const scoreA = a.thread.aiScore ?? -1;
          const scoreB = b.thread.aiScore ?? -1;
          return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
        }

        return 0;
      });
  }, [conversations, filters, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  return {
    conversations: filteredAndSortedConversations,
    loading,
    error,
    filters,
    setFilters,
    sortField,
    sortDirection,
    handleSort,
    refetch,
  };
} 