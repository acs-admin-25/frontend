/**
 * AI Toolbar Component
 * Clean, icon-based toolbar for AI response generation and email actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Settings, 
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface AIToolbarProps {
  onGenerateResponse: () => void;
  onSendEmail: () => void;
  onOpenGenerateModal: () => void;
  generatingResponse: boolean;
  isBusy: boolean;
  isFlagged: boolean;
  overrideEnabled: boolean;
  onOverrideToggle: () => void;
  updatingOverride: boolean;
  className?: string;
}

interface TooltipProps {
  text: string;
  isVisible: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tooltip({ text, isVisible, buttonRef }: TooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 40, // Position above the button
        left: rect.left + rect.width / 2 - 50 // Center horizontally
      });
    }
  }, [isVisible, buttonRef]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border/50 whitespace-nowrap z-[9999] pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)'
      }}
    >
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
    </div>
  );
}

export function AIToolbar({
  onGenerateResponse,
  onSendEmail,
  onOpenGenerateModal,
  generatingResponse,
  isBusy,
  isFlagged,
  overrideEnabled,
  onOverrideToggle,
  updatingOverride,
  className
}: AIToolbarProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const generateRef = useRef<HTMLButtonElement>(null);
  const suggestionsRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLButtonElement>(null);
  const overrideRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      {/* Tooltips rendered at document level */}
      <Tooltip 
        text="Generate AI Response" 
        isVisible={activeTooltip === 'generate'} 
        buttonRef={generateRef}
      />
      <Tooltip 
        text="AI Response Suggestions" 
        isVisible={activeTooltip === 'suggestions'} 
        buttonRef={suggestionsRef}
      />
      <Tooltip 
        text="Send Email" 
        isVisible={activeTooltip === 'email'} 
        buttonRef={emailRef}
      />
      <Tooltip 
        text={overrideEnabled ? "Disable Override" : "Enable Override"} 
        isVisible={activeTooltip === 'override'} 
        buttonRef={overrideRef}
      />

      <div className={cn(
        "flex-shrink-0 bg-card border-t border-border/40 shadow-sm",
        className
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - AI Actions */}
          <div className="flex items-center gap-2">
            {/* Generate AI Response */}
            <div className="relative group">
              <button
                ref={generateRef}
                onClick={onGenerateResponse}
                onMouseEnter={() => setActiveTooltip('generate')}
                onMouseLeave={() => setActiveTooltip(null)}
                disabled={isBusy || generatingResponse || isFlagged}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                  "hover:bg-primary/10 hover:scale-105 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  generatingResponse && "animate-pulse"
                )}
                title="Generate AI Response"
              >
                {generatingResponse ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 text-primary" />
                )}
              </button>
            </div>

            {/* Open AI Suggestions Modal */}
            <div className="relative group">
              <button
                ref={suggestionsRef}
                onClick={onOpenGenerateModal}
                onMouseEnter={() => setActiveTooltip('suggestions')}
                onMouseLeave={() => setActiveTooltip(null)}
                disabled={isBusy}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                  "hover:bg-secondary/10 hover:scale-105 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
                title="AI Response Suggestions"
              >
                <MessageSquare className="w-5 h-5 text-secondary" />
              </button>
            </div>

            {/* Send Email */}
            <div className="relative group">
              <button
                ref={emailRef}
                onClick={onSendEmail}
                onMouseEnter={() => setActiveTooltip('email')}
                onMouseLeave={() => setActiveTooltip(null)}
                disabled={isBusy}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                  "hover:bg-accent/10 hover:scale-105 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
                title="Send Email"
              >
                <Mail className="w-5 h-5 text-accent-foreground" />
              </button>
            </div>
          </div>

          {/* Right side - Status and Settings */}
          <div className="flex items-center gap-2">
            {/* Status Indicators */}
            {isFlagged && (
              <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span>Flagged</span>
              </div>
            )}

            {overrideEnabled && (
              <div className="flex items-center gap-1 px-2 py-1 bg-status-success/10 text-status-success text-xs rounded-full">
                <CheckCircle className="w-3 h-3" />
                <span>Override Enabled</span>
              </div>
            )}

            {/* Override Toggle */}
            <div className="relative group">
              <button
                ref={overrideRef}
                onClick={onOverrideToggle}
                onMouseEnter={() => setActiveTooltip('override')}
                onMouseLeave={() => setActiveTooltip(null)}
                disabled={updatingOverride}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                  "hover:bg-muted hover:scale-105 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  overrideEnabled && "bg-status-success/10 text-status-success"
                )}
                title={overrideEnabled ? "Disable Override" : "Enable Override"}
              >
                {updatingOverride ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 