/**
 * Base Widget Component
 * Provides shared functionality for all widgets including dragging, collapse/expand, and close controls
 */

import React from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { WidgetInstance, WidgetActions, WidgetState } from '@/types/widgets';
import type { Conversation } from '@/types/conversation';

interface BaseWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onRemoveWidget: (widgetId: string) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
  children: React.ReactNode;
}

export function BaseWidget({
  widget,
  conversation,
  actions,
  state,
  onRemoveWidget,
  onMakeWidgetFloat,
  className,
  children
}: BaseWidgetProps) {
  const handleExpand = () => {
    if (onMakeWidgetFloat) {
      // Calculate position to float the widget
      const dashboard = document.querySelector('[data-dashboard-layout]') as HTMLElement;
      if (dashboard) {
        const dashboardRect = dashboard.getBoundingClientRect();
        const position = {
          x: dashboardRect.left + dashboardRect.width * 0.1, // 10% from left
          y: dashboardRect.top + dashboardRect.height * 0.1   // 10% from top
        };
        onMakeWidgetFloat(widget.id, position);
      }
    }
  };

  const handleClose = () => {
    onRemoveWidget(widget.id);
  };

  // Safety check for widget config
  if (!widget || !widget.config) {
    console.warn('Widget or widget config is undefined:', widget);
    return null;
  }

  // Get widget name with fallback for corrupted data
  const widgetName = widget.config.name || 'Widget';

  return (
    <div className={cn("w-full h-full flex flex-col p-2", className)}>
      <div className="space-y-2 flex-1">
        {/* Header with Controls */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-foreground truncate">{widgetName}</h4>
            <p className="text-xs text-muted-foreground">{widget.config.size || '1x1'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExpand}
              className="p-1.5 hover:bg-primary/10 hover:text-primary rounded transition-colors flex-shrink-0 group"
              title="Float widget (drag to move around page)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors flex-shrink-0 group"
              title="Close widget"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
} 