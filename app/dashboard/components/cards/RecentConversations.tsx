/**
 * File: components/features/dashboard/RecentConversations.tsx
 * Purpose: Displays the 5 most recent conversations using processed Conversation data
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.3.0
 */

import React, { useEffect, useState } from 'react';
import { ConversationCard } from '../../conversations/conversations/ConversationCard';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useOptimisticConversations } from '@/lib/hooks/useOptimisticConversations';
import { apiClient } from '@/lib/api/client';
import { useSession } from 'next-auth/react';
import type { Conversation } from '@/lib/types/conversation';

interface RecentConversationsProps {
  conversations?: Conversation[];
}

export function RecentConversations({ conversations = [] }: RecentConversationsProps) {
  const { data: session } = useSession() as { 
    data: (any & { user: { id: string; account_id: string; email?: string } }) | null; 
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const [savedContacts, setSavedContacts] = useState<string[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Use the optimistic conversations hook for actions
  const { 
    markAsRead, 
    toggleLcp, 
    deleteConversation 
  } = useOptimisticConversations();

  // Load saved contacts to filter them out
  useEffect(() => {
    const loadSavedContacts = async () => {
      try {
        setLoadingContacts(true);
        
        // Try to fetch saved contacts from the database
        // If the table doesn't exist, we'll just use an empty array
                    const response = await apiClient.dbSelect({
                collection_name: 'ManualContacts',
                filters: [{ field: 'associated_account', op: '==', value: (session?.user as any)?.account_id || '' }],
                account_id: (session?.user as any)?.account_id || ''
            });

        if (response.success && response.data) {
          const contactEmails = response.data.map((contact: any) => contact.email).filter(Boolean);
          setSavedContacts(contactEmails);
          console.log('[RecentConversations] Loaded saved contacts:', contactEmails);
        } else {
          console.log('[RecentConversations] No saved contacts found or table doesn\'t exist, using empty array');
          setSavedContacts([]);
        }
      } catch (error) {
        console.log('[RecentConversations] Error loading saved contacts (table may not exist), using empty array:', error);
        setSavedContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadSavedContacts();
  }, [session?.user?.account_id]);

  // Data is now pre-sorted by lastMessageAt in descending order from processThreadsResponse
  // Filter out empty conversations (no actual conversation), then take the first 5 conversations (most recent first)
  const conversationsWithMessages = conversations.filter(conv => conv.messages.length > 0);
  const recentConversations = conversationsWithMessages.slice(0, 5);

  // Enhanced debugging logs
  // Enhanced debugging logs
  console.log('[RecentConversations] Component render:', {
    totalConversations: conversations.length,
    recentConversationsCount: recentConversations.length,
    sampleConversation: recentConversations[0] ? {
      id: recentConversations[0].thread.conversation_id,
      lead_name: recentConversations[0].thread.lead_name,
      client_email: recentConversations[0].thread.client_email,
      source_name: recentConversations[0].thread.source_name,
      messagesCount: recentConversations[0].messages.length,
      firstMessage: recentConversations[0].messages[0] ? {
        content: recentConversations[0].messages[0].content?.substring(0, 100),
        type: recentConversations[0].messages[0].type,
        timestamp: recentConversations[0].messages[0].timestamp
      } : null
    } : null,
    allConversations: conversations.map(c => ({
      id: c.thread.conversation_id,
      lead_name: c.thread.lead_name,
      client_email: c.thread.client_email,
      source_name: c.thread.source_name,
      lastMessageAt: c.thread.lastMessageAt,
      createdAt: c.thread.createdAt,
      completed: c.thread.completed
    })),
    // Check for duplicates
    duplicateIds: conversations.reduce((acc, conv) => {
      const id = conv.thread.conversation_id;
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    // Check for unknown leads
    unknownLeads: conversations.filter(c => 
      !c.thread.lead_name || 
      c.thread.lead_name === 'unknown' || 
      c.thread.lead_name === 'Unknown'
    ).map(c => ({
      id: c.thread.conversation_id,
      lead_name: c.thread.lead_name,
      client_email: c.thread.client_email,
      source_name: c.thread.source_name
    }))
  });

  // Additional explicit logging for debugging
  console.log('[RecentConversations] DETAILED DATA:');
  conversations.forEach((conv, index) => {
    console.log(`Conversation ${index + 1}:`, {
      id: conv.thread.conversation_id,
      lead_name: conv.thread.lead_name,
      client_email: conv.thread.client_email,
      source_name: conv.thread.source_name,
      messagesCount: conv.messages.length,
      isUnknown: !conv.thread.lead_name || conv.thread.lead_name === 'unknown' || conv.thread.lead_name === 'Unknown'
    });
  });

  const duplicates = conversations.reduce((acc, conv) => {
    const id = conv.thread.conversation_id;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const duplicateEntries = Object.entries(duplicates).filter(([id, count]) => count > 1);
  if (duplicateEntries.length > 0) {
    console.warn('[RecentConversations] DUPLICATE CONVERSATION IDS FOUND:', duplicateEntries);
  }

  // Check for duplicate emails (same person, different conversation IDs)
  const emailCounts = conversations.reduce((acc, conv) => {
    const email = conv.thread.client_email;
    if (email) {
      acc[email] = (acc[email] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const duplicateEmails = Object.entries(emailCounts).filter(([email, count]) => count > 1);
  if (duplicateEmails.length > 0) {
    console.warn('[RecentConversations] DUPLICATE EMAILS FOUND (same person, different conversations):', duplicateEmails);
  }

  // Check for empty conversations
  const emptyConversations = conversations.filter(c => c.messages.length === 0);
  if (emptyConversations.length > 0) {
    console.warn('[RecentConversations] EMPTY CONVERSATIONS FOUND:', emptyConversations.map(c => ({
      id: c.thread.conversation_id,
      lead_name: c.thread.lead_name,
      client_email: c.thread.client_email,
      messagesCount: c.messages.length
    })));
  }

  const unknownLeads = conversations.filter(c => 
    !c.thread.lead_name || 
    c.thread.lead_name === 'unknown' || 
    c.thread.lead_name === 'Unknown'
  );
  
  if (unknownLeads.length > 0) {
    console.warn('[RecentConversations] UNKNOWN LEADS FOUND:', unknownLeads.map(c => ({
      id: c.thread.conversation_id,
      lead_name: c.thread.lead_name,
      client_email: c.thread.client_email,
      source_name: c.thread.source_name
    })));
  }

  // Show loading state while contacts are being loaded
  if (loadingContacts) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Conversations</h3>
          <a href="/dashboard/conversations" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" text="Loading contacts..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Conversations</h3>
        <a href="/dashboard/conversations" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </a>
      </div>
      
      <div className="space-y-4">
        {recentConversations.length > 0 ? (
          recentConversations.map((conversation: Conversation) => (
            <ConversationCard
              key={conversation.thread.conversation_id}
              conversation={conversation}
              variant="simple"
              onMarkAsRead={markAsRead}
              onToggleLcp={toggleLcp}
              onDelete={deleteConversation}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold text-muted-foreground">No recent activity</h4>
            <p className="text-sm text-muted-foreground/70">New conversations will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
} 