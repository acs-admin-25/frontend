/**
 * Conversation AI Response Component
 * AI response generation section placed at the bottom of the conversation
 */

import React from 'react';
import { Sparkles, Mail, Info } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { OverrideStatus } from './OverrideStatus';

interface ConversationAIResponseProps {
  messageInput: string;
  onMessageChange: (value: string) => void;
  onGenerateResponse: () => void;
  onSendEmail: () => void;
  generatingResponse: boolean;
  isBusy: boolean;
  isFlagged: boolean;
  isFlaggedForCompletion: boolean;
  overrideEnabled: boolean;
  onOverrideToggle: () => void;
  updatingOverride: boolean;
  overrideButtonPulsing: boolean;
  onOpenGenerateModal: () => void;
  className?: string;
}

export function ConversationAIResponse({
  messageInput,
  onMessageChange,
  onGenerateResponse,
  onSendEmail,
  generatingResponse,
  isBusy,
  isFlagged,
  isFlaggedForCompletion,
  overrideEnabled,
  onOverrideToggle,
  updatingOverride,
  overrideButtonPulsing,
  onOpenGenerateModal,
  className
}: ConversationAIResponseProps) {
  return (
    <div className={cn("flex-shrink-0 bg-card border-t border-border/40", className)}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">AI Response</h3>
            <button
              type="button"
              onClick={onOpenGenerateModal}
              className="p-1 rounded-full hover:bg-primary/10 focus:outline-none transition-colors"
              title="Open AI Suggestions"
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </button>
          </div>
          <OverrideStatus 
            isEnabled={overrideEnabled} 
            onToggle={onOverrideToggle}
            updating={updatingOverride}
            pulsating={overrideButtonPulsing}
          />
        </div>

        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2 mb-4">
          <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-primary">
            <p className="font-medium mb-1">Email Details</p>
            <ul className="list-disc list-inside space-y-1 text-primary/80">
              <li>Subject will be automatically generated</li>
              <li>Your email signature will be appended</li>
              <li>You can edit the response before sending</li>
            </ul>
          </div>
        </div>

        {/* Response Textarea */}
        <div className="mb-4">
          <textarea
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={isBusy ? "Email sending in progress..." : "Type or generate your reply..."}
            className="w-full p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base text-foreground bg-background min-h-[120px]"
            disabled={isBusy}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onGenerateResponse}
            disabled={isBusy || generatingResponse || isFlagged || isFlaggedForCompletion}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {generatingResponse ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate</span>
              </>
            )}
          </button>
          <button
            onClick={onSendEmail}
            disabled={!messageInput.trim() || isBusy}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
} 