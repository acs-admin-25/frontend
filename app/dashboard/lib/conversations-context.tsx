'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { Conversation } from '@/lib/types/conversation';
import { processThreadsResponse } from '@/lib/utils/api';

interface ConversationsContextType {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshConversations: () => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() as { 
    data: (Session & { user: { id: string; email?: string } }) | null; 
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversations = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lcp/get_all_threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      if (data.success) {
        // Process the raw data through the centralized processing function
        const processedConversations = processThreadsResponse(data.data);
        setConversations(processedConversations);
        setLastUpdated(new Date());
        console.log('✅ Conversations refreshed successfully:', processedConversations.length, 'conversations');
      } else {
        throw new Error(data.error || 'Failed to fetch conversations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForNewEmails = async () => {
    if (!session?.user?.id) return;

    try {
      // Query the Users table for the current user's new_email field
      const response = await fetch('/api/db/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_name: 'Users',
          index_name: 'id-index',
          key_name: 'id',
          key_value: session.user.id,
          account_id: session.user.id
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to check for new emails:', response.statusText);
        return;
      }

      const data = await response.json();
      if (data.success && data.items && data.items.length > 0) {
        const userRecord = data.items[0];
        
        // Check if new_email is true
        if (userRecord.new_email === true) {
          console.log('🔄 New email detected, refreshing conversations...');
          
          // Refresh conversations
          await fetchConversations();
          
          // Update the new_email field to false
          const updateResponse = await fetch('/api/db/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              table_name: 'Users',
              index_name: 'id-index',
              key_name: 'id',
              key_value: session.user.id,
              update_data: { new_email: false },
              account_id: session.user.id
            }),
            credentials: 'include',
          });

          if (!updateResponse.ok) {
            console.error('Failed to update new_email field:', updateResponse.statusText);
          } else {
            console.log('✅ Successfully updated new_email field to false');
          }
        }
      }
    } catch (err) {
      console.error('Error checking for new emails:', err);
    }
  };

  // Initial fetch and setup
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !isInitialized) {
      // Load threads once after everything is mounted
      fetchConversations();
      setIsInitialized(true);
      
      // Set up 5-minute interval to check for new emails
      intervalRef.current = setInterval(checkForNewEmails, 5 * 60 * 1000); // 5 minutes
    }
  }, [status, session?.user?.id, isInitialized]);

  // Cleanup interval on unmount or session change
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const refreshConversations = async () => {
    console.log('🔄 Manual refresh requested...');
    await fetchConversations();
  };

  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.thread.conversation_id === conversationId
          ? { ...conv, ...updates }
          : conv
      )
    );
  };

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