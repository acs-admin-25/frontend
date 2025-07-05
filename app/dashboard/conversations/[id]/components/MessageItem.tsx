import React from 'react';
import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, User, Bot, AlertTriangle, Info } from 'lucide-react';
import { EVScoreInfoModal } from '@/app/dashboard/analytics/components/EVScoreInfoModal';
import { formatLocalTimeOnly } from '@/lib/utils/timezone';
import { cn } from '@/lib/utils/utils';
import { Message } from 'postcss';

/**
 * Message Item Component
 * Displays individual messages with feedback options
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
          <div className="whitespace-pre-line text-sm leading-relaxed">{message.body}</div>
        </div>
        
        {/* Message Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{isUser ? "You" : (message.sender_name || message.sender_email || clientEmail)}</span>
          <span>·</span>
          <span>{message.localDate ? formatLocalTimeOnly(message.localDate.toISOString()) : ""}</span>
          
          {/* EV Score and Feedback for Client Messages */}
          {!isUser && typeof message.ev_score === 'number' && message.ev_score >= 0 && message.ev_score <= 100 && (
            <span className="ml-2 flex items-center gap-1">
              <button
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border focus:outline-none bg-muted text-foreground"
                onClick={() => setShowEVModal(true)}
                aria-label="Show EV Score info"
                type="button"
              >
                <Info className="w-4 h-4 mr-1" />
                EV {message.ev_score}
              </button>
              <EVScoreInfoModal isOpen={showEVModal} onClose={() => setShowEVModal(false)} score={message.ev_score} modalId={`ev-modal-${message.id}`} />
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