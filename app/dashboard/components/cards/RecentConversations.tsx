/**
 * File: components/features/dashboard/RecentConversations.tsx
 * Purpose: Displays the 5 most recent conversations using processed Conversation data
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.3.0
 */

import React from 'react';
import { ConversationCard } from '../../conversations/conversations/ConversationCard';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useOptimisticConversations } from '@/lib/hooks/useOptimisticConversations';
import type { Conversation } from '@/types/conversation';

interface RecentConversationsProps {
  conversations?: Conversation[];
}

export function RecentConversations({ conversations = [] }: RecentConversationsProps) {
  // Use the optimistic conversations hook for actions
  const { 
    markAsRead, 
    toggleLcp, 
    deleteConversation 
  } = useOptimisticConversations();

  // Data is now pre-sorted by lastMessageAt in descending order from processThreadsResponse
  // Just take the first 5 conversations (most recent first)
  const recentConversations = conversations.slice(0, 5);

  console.log('[RecentConversations] Component render:', {
    totalConversations: conversations.length,
    recentConversationsCount: recentConversations.length,
    sampleConversation: recentConversations[0] ? {
      id: recentConversations[0].thread.conversation_id,
      lead_name: recentConversations[0].thread.lead_name,
      messagesCount: recentConversations[0].messages.length
    } : null,
    allConversations: conversations.map(c => ({
      id: c.thread.conversation_id,
      lead_name: c.thread.lead_name,
      lastMessageAt: c.thread.lastMessageAt
    }))
  });

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