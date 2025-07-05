'use client';

import React, { createContext, useContext } from 'react';
import { useOptimisticConversations } from '@/lib/hooks/useOptimisticConversations';
import type { Conversation } from '@/types/conversation';

interface ConversationsContextType {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshConversations: () => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => Promise<boolean>;
  getConversation: (conversationId: string) => Conversation | undefined;
  storageStats: {
    hasData: boolean;
    isStale: boolean;
    conversationCount: number;
    lastUpdated: string | null;
  };
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const {
    conversations,
    loading: isLoading,
    error,
    lastUpdated,
    refresh: refreshConversations,
    updateConversation,
    storageStats
  } = useOptimisticConversations({
    autoRefresh: false, // Let individual components control refresh
    checkNewEmails: true
  });

  const getConversation = (conversationId: string) => {
    return conversations.find(conv => conv.thread.conversation_id === conversationId);
  };

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        isLoading,
        error,
        lastUpdated,
        refreshConversations,
        updateConversation,
        getConversation,
        storageStats
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
} 