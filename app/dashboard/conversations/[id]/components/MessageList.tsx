import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { MessageItem } from './MessageItem';
import { groupMessagesByDate } from '@/lib/utils/conversation';
import type { Conversation, Message } from '@/types/conversation';

export interface MessageListProps {
  conversation: Conversation | null;
  feedback: Record<string, 'like' | 'dislike'>;
  evFeedback: Record<string, 'positive' | 'negative'>;
  updatingFeedbackId: string | null;
  updatingEvFeedbackId: string | null;
  onResponseFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onEvFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  onReport: (messageId: string) => void;
  className?: string;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onJumpToUnread?: () => void;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(({
  conversation,
  feedback,
  evFeedback,
  updatingFeedbackId,
  updatingEvFeedbackId,
  onResponseFeedback,
  onEvFeedback,
  onReport,
  className,
  searchInputRef,
  searchQuery = '',
  onSearchChange,
  onJumpToUnread
}, ref) => {
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const internalSearchRef = useRef<HTMLInputElement>(null);
  
  // Use provided ref or internal ref
  const searchRef = searchInputRef || internalSearchRef;

  // Extract data from conversation
  const messages = conversation?.messages || [];
  const clientEmail = conversation?.thread?.client_email || '';

  const groupedMessages = groupMessagesByDate(messages);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Filter messages based on search query
  const filteredGroups = Object.entries(groupedMessages).map(([date, dateMessages]) => ({
    date,
    messages: dateMessages.filter(message =>
      message.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.messages.length > 0);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle scroll to show/hide new message button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowNewMessageButton(!isNearBottom);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={ref} className={cn("flex flex-col h-full", className)}>
      {/* Messages Container - Google Docs Style */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 bg-background scrollbar-message"
      >
        {filteredGroups.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery ? 'No messages found matching your search.' : 'No messages found.'}
          </div>
        ) : (
          filteredGroups.map((group, groupIndex) => (
            <div key={group.date} className="space-y-4">
              {/* Date Separator - Google Docs Style */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{group.date}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {group.messages.map((message, messageIndex) => {
                  const isLastMessage = groupIndex === filteredGroups.length - 1 && 
                                       messageIndex === group.messages.length - 1;
                  
                  return (
                    <div
                      key={`${message.id}-${messageIndex}`}
                      id={`message-${message.id}`}
                      ref={isLastMessage ? endOfMessagesRef : undefined}
                    >
                      <MessageItem
                        message={message}
                        index={messageIndex}
                        clientEmail={clientEmail}
                        feedback={feedback}
                        evFeedback={evFeedback}
                        updatingFeedbackId={updatingFeedbackId}
                        updatingEvFeedbackId={updatingEvFeedbackId}
                        onResponseFeedback={onResponseFeedback}
                        onEvFeedback={onEvFeedback}
                        onReport={onReport}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating New Message Button - Google Docs Style */}
      {showNewMessageButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 flex items-center gap-2 px-4 py-2 bg-primary text-text-on-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors z-10"
        >
          <ChevronDown className="w-4 h-4" />
          <span className="text-sm font-medium">New messages</span>
        </button>
      )}
    </div>
  );
});

MessageList.displayName = 'MessageList'; 