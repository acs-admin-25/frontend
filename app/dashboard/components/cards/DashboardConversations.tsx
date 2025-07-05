import React from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Conversation } from '@/types/conversation';

interface DashboardConversationsProps {
  conversations: Conversation[];
  isLoading?: boolean;
  onConversationClick?: (conversation: Conversation) => void;
}

export function DashboardConversations({ conversations }: DashboardConversationsProps) {
  const getStatusIcon = (conversation: Conversation) => {
    if (conversation.thread.completed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (conversation.thread.flag_for_review) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    } else if (conversation.thread.busy) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (conversation: Conversation) => {
    if (conversation.thread.completed) {
      return 'bg-green-100 text-green-800';
    } else if (conversation.thread.flag_for_review) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (conversation.thread.busy) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (conversation: Conversation) => {
    if (conversation.thread.completed) {
      return 'completed';
    } else if (conversation.thread.flag_for_review) {
      return 'review';
    } else if (conversation.thread.busy) {
      return 'busy';
    } else {
      return 'active';
    }
  };

  const getPriorityColor = (conversation: Conversation) => {
    const priority = conversation.thread.priority;
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return 'No messages';
    const sortedMessages = [...conversation.messages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedMessages[0].body || 'No content';
  };

  const getConversationTitle = (conversation: Conversation) => {
    return conversation.thread.lead_name || 
           conversation.thread.source_name || 
           conversation.thread.client_email || 
           'Unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Conversations</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {conversations.slice(0, 5).map((conversation) => (
          <div key={conversation.thread.conversation_id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(conversation)}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {getConversationTitle(conversation)}
                  </h4>
                  <p className="text-sm text-gray-500 truncate max-w-xs">
                    {getLastMessage(conversation)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conversation)}`}>
                  {getStatusText(conversation)}
                </span>
                {conversation.thread.priority && (
                  <span className={`text-xs font-medium ${getPriorityColor(conversation)}`}>
                    {conversation.thread.priority}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>1 participant</span>
              <span>{conversation.messages.length} messages</span>
              <span>{new Date(conversation.thread.lastMessageAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      {conversations.length > 5 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all conversations
          </button>
        </div>
      )}
    </div>
  );
} 