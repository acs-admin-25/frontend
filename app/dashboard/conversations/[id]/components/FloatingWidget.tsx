/**
 * Floating Widget Component
 * Allows widgets to be dragged around the page as overlays
 * Uses ACS theme colors and follows component standards
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical, Minimize2 } from 'lucide-react';
import { ContactWidget } from '@/app/dashboard/contacts/components/ContactWidget';
import { AIInsights } from './AIInsights';
import { FlaggedStatusWidget } from './FlaggedStatusWidget';
import { SpamStatusWidget } from './SpamStatusWidget';
import { NotesWidget } from './NotesWidget';
import { cn } from '@/lib/utils/utils';
import { Conversation } from '@/lib/types/conversation';
import { WidgetActions, WidgetInstance, WidgetState } from '@/lib/types/widgets';

interface FloatingWidgetProps {
  widget: WidgetInstance;
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onClose: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onSnapToColumn?: () => void;
}

// Widget component mapping
const WIDGET_COMPONENTS = {
  'contact': ContactWidget,
  'ai-insights': AIInsights,
  'flagged-status': FlaggedStatusWidget,
  'spam-status': SpamStatusWidget,
  'notes': NotesWidget,
} as const;

export function FloatingWidget({
  widget,
  conversation,
  actions,
  state,
  onClose,
  onDragEnd,
  onSnapToColumn
}: FloatingWidgetProps) {
  const [position, setPosition] = useState({ x: widget.position.x, y: widget.position.y });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isOverColumn, setIsOverColumn] = useState(false);
  const [shouldPopOut, setShouldPopOut] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const WidgetComponent = WIDGET_COMPONENTS[widget.widgetId as keyof typeof WIDGET_COMPONENTS];

  // Mock onRemoveWidget for floating widgets - just calls onClose
  const handleRemoveWidget = () => {
    onClose();
  };

  // Handle different widget prop requirements
  const renderWidget = () => {
    if (widget.widgetId === 'ai-insights') {
      return <AIInsights thread={conversation?.thread || null} />;
    }
    
    if (widget.widgetId === 'contact') {
      return (
        <ContactWidget
          widget={widget}
          conversation={conversation}
          actions={actions}
          state={state}
          onRemoveWidget={handleRemoveWidget}
          className="w-full h-full"
        />
      );
    }
    
    if (widget.widgetId === 'flagged-status') {
      return (
        <FlaggedStatusWidget
          conversation={conversation}
          onUnflag={() => actions.onUnflag?.()}
          updating={state.updating || false}
          onComplete={actions.onComplete}
          onClearFlag={actions.onClearFlag}
          clearingFlag={state.clearingFlag || false}
        />
      );
    }
    
    if (widget.widgetId === 'spam-status') {
      return (
        <SpamStatusWidget
          conversation={conversation}
          onMarkAsNotSpam={() => actions.onMarkAsNotSpam?.()}
          updating={state.updating || false}
        />
      );
    }
    
    if (widget.widgetId === 'notes') {
      return (
        <NotesWidget
          notes={''}
          onSave={(notes: string) => console.log('Save notes:', notes)}
        />
      );
    }
    
    return null;
  };

  // Initialize position if not already set
  useEffect(() => {
    if (position.x === 0 && position.y === 0) {
      const initializePosition = () => {
        const dashboard = document.querySelector('[data-dashboard-layout]') as HTMLElement;
        if (dashboard && widgetRef.current) {
          const dashboardRect = dashboard.getBoundingClientRect();
          const widgetRect = widgetRef.current.getBoundingClientRect();
          
          // Calculate initial position within dashboard bounds
          const initialX = Math.max(
            dashboardRect.left + 50,
            Math.min(
              dashboardRect.right - widgetRect.width - 50,
              dashboardRect.left + (dashboardRect.width / 2)
            )
          );
          const initialY = Math.max(
            dashboardRect.top + 100,
            Math.min(
              dashboardRect.bottom - widgetRect.height - 100,
              dashboardRect.top + (dashboardRect.height / 2)
            )
          );
          
          setPosition({ x: initialX, y: initialY });
        }
      };

      // Initialize position after component mounts
      const timer = setTimeout(initializePosition, 100);
      return () => clearTimeout(timer);
    }
  }, [position.x, position.y]);

  // Check if widget is over the left column
  const checkIfOverColumn = (x: number, y: number) => {
    const dashboard = document.querySelector('[data-dashboard-layout]') as HTMLElement;
    if (dashboard && widgetRef.current) {
      const dashboardRect = dashboard.getBoundingClientRect();
      const widgetRect = widgetRef.current.getBoundingClientRect();
      
      // Calculate left column bounds - responsive to screen size
      let columnWidth;
      if (dashboardRect.width >= 1024) {
        // Large screens: column is 1/3 of width
        columnWidth = dashboardRect.width * 0.33;
      } else if (dashboardRect.width >= 768) {
        // Medium screens: column is 40% of width
        columnWidth = dashboardRect.width * 0.4;
      } else {
        // Small screens: column is 50% of width
        columnWidth = dashboardRect.width * 0.5;
      }
      
      const columnRight = dashboardRect.left + columnWidth;
      
      // Check if widget center is over the column
      const widgetCenterX = x + widgetRect.width / 2;
      const widgetCenterY = y + widgetRect.height / 2;
      
      // Add some tolerance for easier snapping
      const tolerance = 50; // pixels
      
      return widgetCenterX <= columnRight + tolerance && 
             widgetCenterY >= dashboardRect.top - tolerance && 
             widgetCenterY <= dashboardRect.bottom + tolerance;
    }
    return false;
  };

  // Check if widget should pop out (dragged outside column area)
  const checkIfShouldPopOut = (x: number, y: number) => {
    const dashboard = document.querySelector('[data-dashboard-layout]') as HTMLElement;
    if (dashboard && widgetRef.current) {
      const dashboardRect = dashboard.getBoundingClientRect();
      const widgetRect = widgetRef.current.getBoundingClientRect();
      
      // Calculate column bounds (same as above)
      let columnWidth;
      if (dashboardRect.width >= 1024) {
        columnWidth = dashboardRect.width * 0.33;
      } else if (dashboardRect.width >= 768) {
        columnWidth = dashboardRect.width * 0.4;
      } else {
        columnWidth = dashboardRect.width * 0.5;
      }
      
      const columnRight = dashboardRect.left + columnWidth;
      
      // Check if widget is dragged significantly outside the column
      const widgetLeft = x;
      const widgetRight = x + widgetRect.width;
      
      // Pop out if dragged to the right of the column or if more than 50% is outside
      const shouldPopOut = widgetLeft > columnRight || 
                          (widgetRight - columnRight) > (widgetRect.width * 0.5);
      
      return shouldPopOut;
    }
    return false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const newX = e.clientX - dragOffset.x;
          const newY = e.clientY - dragOffset.y;
          
          // Check if over column
          const overColumn = checkIfOverColumn(newX, newY);
          setIsOverColumn(overColumn);
          
          // Check if should pop out
          const popOut = checkIfShouldPopOut(newX, newY);
          setShouldPopOut(popOut);
          
          // Constrain to dashboard bounds
          const dashboard = document.querySelector('[data-dashboard-layout]') as HTMLElement;
          if (dashboard && widgetRef.current) {
            const dashboardRect = dashboard.getBoundingClientRect();
            const widgetRect = widgetRef.current.getBoundingClientRect();
            
            const constrainedX = Math.max(
              dashboardRect.left,
              Math.min(dashboardRect.right - widgetRect.width, newX)
            );
            const constrainedY = Math.max(
              dashboardRect.top,
              Math.min(dashboardRect.bottom - widgetRect.height, newY)
            );
            
            setPosition({ x: constrainedX, y: constrainedY });
          }
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        // If over column, snap to column
        if (isOverColumn && onSnapToColumn) {
          onSnapToColumn();
        } else if (shouldPopOut) {
          // If should pop out, keep as floating widget
          onDragEnd(position);
        } else {
          onDragEnd(position);
        }
        
        setIsOverColumn(false);
        setShouldPopOut(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.overflow = 'hidden'; // Prevent scrolling while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
    };
  }, [isDragging, dragOffset, position, onDragEnd, isOverColumn, onSnapToColumn, shouldPopOut]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || e.target === e.currentTarget.querySelector('.drag-handle')) {
      e.preventDefault();
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
      }
    }
  };

  if (!WidgetComponent) {
    console.warn(`Widget component not found for: ${widget.widgetId}`);
    return null;
  }

  // Calculate responsive widget size based on widget config
  const getWidgetSize = () => {
    const [width, height] = widget.config.size.split('x').map(Number);
    const baseWidth = 300;
    const baseHeight = 200;
    
    // Scale based on widget size
    const scaleFactor = Math.max(width, height);
    
    // Responsive adjustments based on screen size
    let responsiveWidth, responsiveHeight;
    
    if (window.innerWidth >= 1200) {
      // Large screens - larger widgets
      responsiveWidth = Math.min(600, baseWidth * (scaleFactor * 1.2));
      responsiveHeight = Math.min(800, baseHeight * (scaleFactor * 1.2));
    } else if (window.innerWidth >= 768) {
      // Medium screens - medium widgets
      responsiveWidth = Math.min(500, baseWidth * (scaleFactor * 1.0));
      responsiveHeight = Math.min(700, baseHeight * (scaleFactor * 1.0));
    } else {
      // Small screens - smaller widgets
      responsiveWidth = Math.min(400, baseWidth * (scaleFactor * 0.8));
      responsiveHeight = Math.min(600, baseHeight * (scaleFactor * 0.8));
    }
    
    return { width: responsiveWidth, height: responsiveHeight };
  };

  const widgetSize = getWidgetSize();

  return (
    <div
      ref={widgetRef}
      className="fixed z-50 transition-all duration-300 ease-out pointer-events-auto animate-in fade-in slide-in-from-bottom-2"
      style={{
        left: position.x,
        top: position.y,
        width: widgetSize.width,
        height: widgetSize.height,
        transform: isDragging ? 'scale(1.02) rotate(1deg)' : 'scale(1) rotate(0deg)',
        filter: isDragging ? 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.25))' : 'drop-shadow(0 10px 15px rgb(0 0 0 / 0.1))',
      }}
    >
      <div
        className={cn(
          "bg-card border-2 border-border/60 rounded-xl shadow-xl overflow-hidden h-full",
          "min-w-[300px] max-w-[500px]",
          isDragging && "cursor-grabbing shadow-2xl border-primary/40",
          isOverColumn && "border-primary shadow-2xl",
          shouldPopOut && "border-secondary shadow-2xl"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-muted/60 border-b border-border/40 cursor-grab active:cursor-grabbing drag-handle">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{widget.config.name}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{widget.config.size}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onSnapToColumn}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Return to Column"
            >
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Close Widget"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Widget Content */}
        <div className="p-3 bg-background/80 h-full">
          {renderWidget()}
        </div>
      </div>
    </div>
  );
} 