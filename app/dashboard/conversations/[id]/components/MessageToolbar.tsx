/**
 * Message Toolbar Component
 * Google Docs-style toolbar for the message list with widget controls
 */

import React from 'react';
import { Search, Calendar, Plus, Grid3X3, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { WidgetInstance } from '@/types/widgets';

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
  className
}: MessageToolbarProps) {
  return (
    <div className={cn("flex-shrink-0 flex items-center justify-between p-4 border-b border-border/40 bg-muted/60", className)}>
      {/* Left side - Search and navigation */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search conversation..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background text-foreground w-64"
          />
        </div>
        <button
          onClick={onJumpToUnread}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Jump to unread
        </button>
      </div>

      {/* Center - Widget controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-2 bg-background/80 border border-border/60 rounded-lg">
          <Grid3X3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Widgets</span>
        </div>
        
        {/* Widget visibility toggles */}
        {widgets.map(widget => (
          <button
            key={widget.id}
            onClick={() => onToggleWidgetVisibility(widget.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors border",
              widget.isVisible 
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50"
            )}
            title={`${widget.isVisible ? 'Hide' : 'Show'} ${widget.config.name}`}
          >
            <div className="w-2 h-2 rounded-full bg-current" />
            <span className="truncate max-w-20">{widget.config.name}</span>
          </button>
        ))}
        
        {/* Add widget button */}
        <button
          onClick={onAddWidget}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Widget
        </button>
      </div>

      {/* Right side - Help */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowKeyboardShortcuts}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Keyboard shortcuts (Ctrl + ?)"
        >
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
} 