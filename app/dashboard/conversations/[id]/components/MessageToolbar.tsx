/**
 * Message Toolbar Component
 * Google Docs-style toolbar for the message list with AI controls and widget management
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Grid3X3, 
  HelpCircle, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Settings, 
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { WidgetInstance } from '@/lib/types/widgets';

interface MessageToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onJumpToUnread: () => void;
  onShowKeyboardShortcuts: () => void;
  widgets: WidgetInstance[];
  onAddWidget: () => void;
  onRemoveWidget: (widgetId: string) => void;
  onToggleWidgetVisibility: (widgetId: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  // AI Toolbar props
  onGenerateResponse: () => void;
  onSendEmail: () => void;
  onOpenGenerateModal: () => void;
  generatingResponse: boolean;
  isBusy: boolean;
  isFlagged: boolean;
  overrideEnabled: boolean;
  onOverrideToggle: () => void;
  updatingOverride: boolean;
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
        top: rect.bottom + 8, // Position below the button
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-popover border-l border-t border-border/50"></div>
    </div>
  );
}

export function MessageToolbar({
  searchQuery,
  onSearchChange,
  onJumpToUnread,
  onShowKeyboardShortcuts,
  widgets,
  onAddWidget,
  onRemoveWidget,
  onToggleWidgetVisibility,
  searchInputRef,
  className,
  // AI Toolbar props
  onGenerateResponse,
  onSendEmail,
  onOpenGenerateModal,
  generatingResponse,
  isBusy,
  isFlagged,
  overrideEnabled,
  onOverrideToggle,
  updatingOverride
}: MessageToolbarProps) {
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

      <div className={cn("flex-shrink-0 flex items-center justify-between p-4 border-b border-border/40 bg-muted/60", className)}>
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

        {/* Center - Search */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversation..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background text-foreground"
            />
          </div>
        </div>

        {/* Right side - Settings and Help */}
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

          {/* Help button */}
          <button
            onClick={onShowKeyboardShortcuts}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Keyboard shortcuts (Ctrl + ?)"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </>
  );
} 