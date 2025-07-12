/**
 * File: components/features/conversations/ConversationCard.tsx
 * Purpose: Consolidated conversation card component for displaying conversations across the application
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 2.1.0 - Updated to use optimistic conversations system
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  Flag, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Settings,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { 
  getMostRecentMessage, 
  getConversationTitle, 
  getLatestEvaluableMessage
} from '@/lib/utils/conversation';

import type { Conversation } from '@/lib/types/conversation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { EVScoreInfoContent } from '@/app/dashboard/analytics/components/EVScoreInfoContent';
import { EVScoreInfoModal } from '@/app/dashboard/analytics/components/EVScoreInfoModal';
import { formatLocalTime } from '@/lib/utils/timezone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Color palette for conversation avatars
const CONVERSATION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
  '#F1C40F', '#1ABC9C', '#E74C3C', '#34495E', '#16A085'
];

// Get consistent color for a conversation
const getConversationColor = (conversationId: string) => {
  if (!conversationId) return CONVERSATION_COLORS[0];
  const hash = conversationId.slice(0, 8).split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return CONVERSATION_COLORS[Math.abs(hash) % CONVERSATION_COLORS.length];
};

// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
};

interface ConversationCardProps {
  conversation: Conversation;
  variant?: 'simple' | 'detailed';
  showActions?: boolean;
  // Add props for conversation actions
  onMarkAsRead?: (conversationId: string) => Promise<boolean>;
  onToggleLcp?: (conversationId: string) => Promise<boolean>;
  onDelete?: (conversationId: string) => Promise<boolean>;
  // Add loading states
  isUpdatingRead?: boolean;
  isUpdatingLcp?: boolean;
  isDeleting?: boolean;
}

export function ConversationCard({ 
  conversation, 
  variant = 'detailed',
  showActions = true,
  onMarkAsRead,
  onToggleLcp,
  onDelete,
  isUpdatingRead = false,
  isUpdatingLcp = false,
  isDeleting = false
}: ConversationCardProps) {
  const router = useRouter();
  const { thread, messages } = conversation;

  // Local state for optimistic updates
  const [localLcpEnabled, setLocalLcpEnabled] = useState(thread.lcp_enabled || false);
  const [localRead, setLocalRead] = useState(thread.read || false);
  const [localIsUpdatingLcp, setLocalIsUpdatingLcp] = useState(false);
  const [localIsUpdatingRead, setLocalIsUpdatingRead] = useState(false);
  const [localIsDeleting, setLocalIsDeleting] = useState(false);
  const [showEVModal, setShowEVModal] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setLocalLcpEnabled(thread.lcp_enabled || false);
    setLocalRead(thread.read || false);
  }, [thread.lcp_enabled, thread.read]);

  // Use prop loading states or local ones
  const updatingRead = isUpdatingRead || localIsUpdatingRead;
  const updatingLcp = isUpdatingLcp || localIsUpdatingLcp;
  const deleting = isDeleting || localIsDeleting;

  // Get the most recent message using centralized utility
  const mostRecentMessage = getMostRecentMessage(conversation);

  // Get conversation details using centralized utilities
  const conversationName = getConversationTitle(conversation);
  const subject = mostRecentMessage?.subject || 'No subject';
  // Get the most recent message timestamp using localDate
  const getLastMessageTime = () => {
    if (messages.length > 0) {
      // Sort messages by localDate and get the most recent
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(b.localDate).getTime() - new Date(a.localDate).getTime()
      );
      const mostRecent = sortedMessages[0];
      if (mostRecent?.localDate) {
        return mostRecent.localDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }
    return null;
  };

  const lastMessageTime = getLastMessageTime();
  const messageCount = messages.length;
  const isUnread = !localRead;
  const isFlagged = thread.flag;
  const isFlaggedForReview = thread.flag_for_review;
  const isPendingReply = mostRecentMessage?.type === 'inbound-email';

  // Get conversation color and initials
  const avatarColor = getConversationColor(thread.conversation_id);
  const initials = getInitials(conversationName);

  // Find the most recent evaluable message for EV score using centralized utility
  const evMessage = getLatestEvaluableMessage(conversation);
  const ev_score = evMessage ? (typeof evMessage.ev_score === 'string' ? parseFloat(evMessage.ev_score) : evMessage.ev_score) : -1;
  const score = typeof ev_score === 'number' && !isNaN(ev_score) ? ev_score : -1;
  const evColorStyle = score >= 0 ? getEvScoreColor(score) : { backgroundColor: '#e5e7eb', color: '#374151' };

  const handleClick = async () => {
    if (isUnread && onMarkAsRead) {
      setLocalIsUpdatingRead(true);
      try {
        const success = await onMarkAsRead(thread.conversation_id);
        if (success) {
          setLocalRead(true);
        }
      } catch (error) {
        console.error('Error marking as read:', error);
      } finally {
        setLocalIsUpdatingRead(false);
      }
    } else {
      router.push(`/dashboard/conversations/${thread.conversation_id}`);
    }
  };

  const handleLcpToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (updatingLcp || !onToggleLcp) return;

    setLocalIsUpdatingLcp(true);
    try {
      // Optimistically update local state
      setLocalLcpEnabled(!localLcpEnabled);
      
      const success = await onToggleLcp(thread.conversation_id);
      if (!success) {
        // Rollback on failure
        setLocalLcpEnabled(localLcpEnabled);
      }
    } catch (error) {
      // Rollback on error
      setLocalLcpEnabled(localLcpEnabled);
      console.error('Error toggling LCP:', error);
    } finally {
      setLocalIsUpdatingLcp(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting || !onDelete) return;

    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      setLocalIsDeleting(true);
      try {
        await onDelete(thread.conversation_id);
      } catch (error) {
        console.error('Error deleting conversation:', error);
      } finally {
        setLocalIsDeleting(false);
      }
    }
  };

  // Simple variant
  if (variant === 'simple') {
    const cardClassName = cn(
      "w-full max-w-4xl mx-auto rounded-lg border overflow-hidden transition-colors cursor-pointer",
      updatingRead || updatingLcp || deleting ? 'opacity-50 pointer-events-none' : '',
      isFlagged
        ? 'bg-emerald-50 border-emerald-200'
        : isFlaggedForReview
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-white border-gray-200'
    );

    return (
      <Card className={cardClassName} onClick={() => { if (!showEVModal) handleClick(); }}>
        <CardContent className="p-4 flex items-center justify-between gap-6">
          {/* Left Section: Avatar, Name, Subject, Date, EV Score */}
          <div className="flex items-start gap-4 flex-grow">
            {/* Avatar */}
            <div 
              className="w-11 h-11 flex items-center justify-center shadow-sm bg-[#0e6537]"
              style={{ 
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px'
              }}
            >
              <span className="text-base font-semibold text-white">
                {initials}
              </span>
            </div>
            
            <div className="grid gap-0.5">
              <div className="flex items-center gap-2">
                <div className="font-bold text-lg text-gray-900">{conversationName}</div>
                {isFlagged && (
                  <Badge className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </Badge>
                )}
                {isFlaggedForReview && (
                  <Badge className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Review
                  </Badge>
                )}
                {isUnread && (
                  <Badge className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <Bell className="w-3 h-3" /> New
                  </Badge>
                )}
              </div>
              <div className="text-base text-gray-800">
                {mostRecentMessage?.content ? 
                  mostRecentMessage.content.length > 100 
                    ? `${mostRecentMessage.content.substring(0, 100)}...` 
                    : mostRecentMessage.content
                  : 'No message content'
                }
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3" /> {lastMessageTime || 'Unknown time'}
                {score >= 0 && (
                  <span className="ml-3 text-emerald-600 font-medium flex items-center gap-1">
                    EV: {score} 
                    <button
                      onClick={e => { e.stopPropagation(); setShowEVModal(true); }}
                      className="hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                      title="View EV Score details"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Button */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              className="px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 border-[#0e6537] text-[#0e6537] hover:bg-[#0e6537]/10 bg-transparent"
            >
              View Details <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
        
        {/* EV Score Modal */}
        {score >= 0 && (
          <EVScoreInfoModal 
            isOpen={showEVModal} 
            onClose={() => setShowEVModal(false)} 
            score={score} 
            modalId={`ev-modal-card-${conversation.thread.conversation_id}`} 
          />
        )}
      </Card>
    );
  }

  // Detailed variant
  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors relative ${
        updatingRead || updatingLcp || deleting ? 'opacity-50 pointer-events-none' : ''
      } ${
        isFlagged
          ? 'border-status-success/20 bg-status-success/5'
          : isFlaggedForReview
          ? 'border-status-warning/20 bg-status-warning/5'
          : 'border-border'
      }`}
      onClick={() => { if (!showEVModal) handleClick(); }}
    >
      {/* Status badges */}
      {!isFlagged && isFlaggedForReview && (
        <div className="absolute -top-2 -right-2 bg-status-warning text-status-warning-foreground px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
          <Flag className="w-3 h-3" />
          <span className="hidden xs:inline">Flagged for Review</span>
          <span className="xs:hidden">Review</span>
        </div>
      )}
      {isFlagged && (
        <div className="absolute -top-2 -right-2 bg-status-success text-status-success-foreground px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          <span className="hidden xs:inline">Flagged for Completion</span>
          <span className="xs:hidden">Complete</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-row sm:flex-col items-center justify-start gap-2 sm:gap-0 sm:w-10 md:w-12 pt-1">
        {isUnread && !updatingRead && (
          <button
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-status-error/10 text-status-error text-xs rounded-full font-semibold shadow-md z-10 hover:bg-status-error/20 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={updatingRead}
          >
            <Bell className="w-3 h-3" />
            <span className="hidden sm:inline">Mark as Read</span>
            <span className="sm:hidden">Read</span>
          </button>
        )}
        {updatingRead && (
          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted text-muted-foreground text-xs rounded-full font-semibold">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">Updating...</span>
            <span className="sm:hidden">...</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-3 flex-1">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: avatarColor }}
          >
            <span className="text-sm font-semibold text-white">
              {initials}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-card-foreground truncate">
              {conversationName}
            </h4>
            <div className="flex items-center gap-2">
              {isPendingReply && (
                <div className="flex items-center gap-1 text-status-warning" title="Awaiting your reply">
                  <Clock className="w-4 h-4" />
                </div>
              )}
              {score >= 0 && (
                <button
                  className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 focus:outline-none"
                  style={evColorStyle}
                  onClick={e => { e.stopPropagation(); setShowEVModal(true); }}
                  aria-label="Show EV Score info"
                  type="button"
                >
                  <Info className="w-4 h-4 mr-1" />
                  EV {score}
                </button>
              )}
              <EVScoreInfoModal isOpen={showEVModal} onClose={() => setShowEVModal(false)} score={score} modalId={`ev-modal-card-detailed-${conversation.thread.conversation_id}`} />
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-medium mb-1 truncate">
            {subject}
          </p>

          {thread.ai_summary && (
            <p className="text-xs text-muted-foreground/70 mb-2 line-clamp-2">
              {thread.ai_summary}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
              {lastMessageTime && (
                <span>{lastMessageTime}</span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      {/* Action Menu */}
      {showActions && (
        <div className="flex flex-row sm:flex-col items-center justify-end gap-2 sm:gap-0 sm:w-10 md:w-12 pt-1">
          {onToggleLcp && (
            <button
              className={cn(
                "flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full font-semibold shadow-md z-10 transition-colors cursor-pointer",
                localLcpEnabled
                  ? "bg-status-success/10 text-status-success hover:bg-status-success/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              onClick={handleLcpToggle}
              disabled={updatingLcp}
              title={localLcpEnabled ? "Disable LCP" : "Enable LCP"}
            >
              {updatingLcp ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Settings className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {localLcpEnabled ? "LCP On" : "LCP Off"}
              </span>
              <span className="sm:hidden">
                {localLcpEnabled ? "On" : "Off"}
              </span>
            </button>
          )}
          
          {onDelete && (
            <button
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-status-error/10 text-status-error text-xs rounded-full font-semibold shadow-md z-10 hover:bg-status-error/20 transition-colors cursor-pointer"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete conversation"
            >
              {deleting ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">Delete</span>
              <span className="sm:hidden">Del</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Get EV score color
const getEvScoreColor = (score: number) => {
  const s = Math.max(0, Math.min(100, score));
  let h = 0;
  if (s <= 50) {
    h = 0 + (48 - 0) * (s / 50);
  } else {
    h = 48 + (142 - 48) * ((s - 50) / 50);
  }
  return {
    backgroundColor: `hsl(${h}, 95%, 90%)`,
    color: `hsl(${h}, 60%, 30%)`,
  };
}; 