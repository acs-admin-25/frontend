import React from 'react';
import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, User, Bot, AlertTriangle, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EVScoreInfoModal } from '@/app/dashboard/analytics/components/EVScoreInfoModal';
import { formatLocalTimeOnly } from '@/lib/utils/timezone';
import { cn } from '@/lib/utils/utils';
import type { Message } from '@/lib/types/conversation';

/**
 * Message Item Component
 * Displays individual messages with feedback options and search highlighting
 * Uses ACS theme colors for consistent styling
 */
export interface MessageItemProps {
  message: Message;
  index: number;
  clientEmail: string;
  feedback: Record<string, 'like' | 'dislike'>;
  evFeedback: Record<string, 'positive' | 'negative'>;
  updatingFeedbackId: string | null;
  updatingEvFeedbackId: string | null;
  onResponseFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onEvFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  onReport: (messageId: string) => void;
}

export function MessageItem({
  message,
  index,
  clientEmail,
  feedback,
  evFeedback,
  updatingFeedbackId,
  updatingEvFeedbackId,
  onResponseFeedback,
  onEvFeedback,
  onReport
}: MessageItemProps) {
  // Fixed logic to determine if message is from user or client
  // Inbound emails are from the client/customer
  // Outbound emails are from the user/AI system
  const isUser = message.type === "outbound-email";
  
  const currentEvFeedback = evFeedback[message.id];
  const currentFeedback = feedback[message.id];
  const isEvUpdating = updatingEvFeedbackId === message.id;
  const isUpdating = updatingFeedbackId === message.id;
  const [showEVModal, setShowEVModal] = React.useState(false);

  // Use regular message body for now
  const messageBody = message.body || '';

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-md w-full flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {/* Message Bubble - Google Docs Style with ACS Theme */}
        <div className={cn(
          "rounded-lg px-4 py-3 shadow-md border",
          isUser 
            ? "bg-primary text-text-on-primary border-primary/20" // White text on primary color for outbound
            : "bg-card text-foreground border-border shadow-sm" // Dark text on card background for inbound
        )}>
          <div className="whitespace-pre-line text-sm leading-relaxed">{messageBody}</div>
        </div>
        
        {/* Message Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{isUser ? "You" : (message.sender_name || message.sender_email || clientEmail)}</span>
          <span>·</span>
          <span>{message.localDate ? formatLocalTimeOnly(message.localDate.toISOString()) : ""}</span>
          
          {/* EV Score and Feedback for Client Messages */}
          {!isUser && (
            <span className="ml-2 flex items-center gap-1">
              {/* Dynamic EV Score Display */}
              {message.ev_score_current !== undefined && message.ev_score_current !== null && 
               message.ev_score_current >= 0 && message.ev_score_current <= 100 && (
                <button
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border focus:outline-none transition-all duration-200",
                    // Score-based colors
                    message.ev_score_current >= 80 ? "bg-status-success/20 text-status-success border-status-success/30" :
                    message.ev_score_current >= 60 ? "bg-warning/20 text-warning border-warning/30" :
                    "bg-status-error/20 text-status-error border-status-error/30",
                    // Status-based animations
                    message.ev_score_status === 'updating' && "animate-pulse",
                    message.ev_score_status === 'improving' && "animate-bounce",
                    message.ev_score_status === 'declining' && "animate-pulse"
                  )}
                  onClick={() => setShowEVModal(true)}
                  aria-label="Show EV Score info"
                  type="button"
                >
                  <Info className="w-4 h-4 mr-1" />
                  EV {message.ev_score_current}
                  
                  {/* Trend Indicator */}
                  {message.ev_score_status === 'improving' && (
                    <TrendingUp className="w-3 h-3 ml-1 text-status-success" />
                  )}
                  {message.ev_score_status === 'declining' && (
                    <TrendingDown className="w-3 h-3 ml-1 text-status-error" />
                  )}
                  {message.ev_score_status === 'stable' && (
                    <Minus className="w-3 h-3 ml-1 text-muted-foreground" />
                  )}
                  {message.ev_score_status === 'updating' && (
                    <div className="w-3 h-3 ml-1 rounded-full bg-muted-foreground animate-pulse" />
                  )}
                </button>
              )}
              
              {/* Score History Indicator */}
              {message.ev_scores && message.ev_scores.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  ({message.ev_scores.length} updates)
                </span>
              )}
              
              <EVScoreInfoModal 
                isOpen={showEVModal} 
                onClose={() => setShowEVModal(false)} 
                score={message.ev_score_current || message.ev_score || 0}
                scoreHistory={message.ev_scores}
                scoreStatus={message.ev_score_status}
                modalId={`ev-modal-${message.id}`} 
              />
              
              {!isEvUpdating && (
                <>
                  <button
                    onClick={() => onEvFeedback(message.id, 'positive')}
                    disabled={isEvUpdating}
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      currentEvFeedback === 'positive' ? "bg-status-success/20 text-status-success" : "hover:bg-muted text-muted-foreground",
                      isEvUpdating && "animate-pulse"
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEvFeedback(message.id, 'negative')}
                    disabled={isEvUpdating}
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      currentEvFeedback === 'negative' ? "bg-status-error/20 text-status-error" : "hover:bg-muted text-muted-foreground",
                      isEvUpdating && "animate-pulse"
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </>
              )}
            </span>
          )}
          
          {/* Feedback for User Messages */}
          {isUser && !isUpdating && (
            <span className="ml-2 flex items-center gap-1">
              <button
                onClick={() => onResponseFeedback(message.id, 'like')}
                disabled={isUpdating}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  currentFeedback === 'like' ? "bg-status-success/20 text-status-success" : "hover:bg-muted text-muted-foreground",
                  isUpdating && "animate-pulse"
                )}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onResponseFeedback(message.id, 'dislike')}
                disabled={isUpdating}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  currentFeedback === 'dislike' ? "bg-status-error/20 text-status-error" : "hover:bg-muted text-muted-foreground",
                  isUpdating && "animate-pulse"
                )}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
              <button
                className="p-0.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                onClick={() => onReport(message.id)}
                aria-label="Report response"
                title="Report this AI response"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 