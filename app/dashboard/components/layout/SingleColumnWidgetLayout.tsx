/**
 * Single Column Widget Layout Component
 * Provides a single column grid-based widget system with snap-to-grid functionality
 * Uses ACS theme colors and follows component standards
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Plus, Grid3X3, X, Move, Maximize2 } from 'lucide-react';
import { Conversation } from '@/lib/types/conversation';
import { WidgetInstance, WidgetActions, WidgetState } from '@/lib/types/widgets';
import { cn } from '@/lib/utils/utils';
import { ContactWidget } from '../../contacts/components/ContactWidget';
import { FlaggedStatusWidget, SpamStatusWidget, NotesWidget, AIInsights } from '../../conversations/[id]/components';
import { ConversationMetricsWidget } from '../../conversations/[id]/components/ConversationMetricsWidget';
import { QuickActionsWidget } from '../../conversations/[id]/components/QuickActionsWidget';
import { EmailTemplatesWidget } from '../../conversations/[id]/components/EmailTemplatesWidget';

// Import widget components

interface SingleColumnWidgetLayoutProps {
  widgets: WidgetInstance[];
  conversation: Conversation | null;
  actions: WidgetActions;
  state: WidgetState;
  onAddWidget: () => void;
  onRemoveWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, newPosition: { x: number; y: number }) => void;
  onReorderColumnWidgets?: (draggedWidgetId: string, targetIndex: number) => void;
  onMakeWidgetFloat?: (widgetId: string, position: { x: number; y: number }) => void;
  className?: string;
}

// Grid configuration
const GRID_CONFIG = {
  columns: 1,
  rows: 4,
  minHeight: 400
};

// AIInsights Widget Wrapper
const AIInsightsWidget = ({ widget, conversation, actions, state, onRemoveWidget, onMakeWidgetFloat, className }: any) => (
  <AIInsights 
    widget={widget}
    conversation={conversation} 
    actions={actions}
    state={state}
    onRemoveWidget={onRemoveWidget}
    onMakeWidgetFloat={onMakeWidgetFloat}
    className={className}
  />
);

// Widget component mapping
const WIDGET_COMPONENTS = {
  'contact': ContactWidget,
  'ai-insights': AIInsightsWidget,
  'flagged-status': FlaggedStatusWidget,
  'spam-status': SpamStatusWidget,
  'notes': NotesWidget,
  'conversation-metrics': ConversationMetricsWidget,
  'quick-actions': QuickActionsWidget,
  'email-templates': EmailTemplatesWidget,
} as const;

export function SingleColumnWidgetLayout({
  widgets,
  conversation,
  actions,
  state,
  onAddWidget,
  onRemoveWidget,
  onMoveWidget,
  onReorderColumnWidgets,
  onMakeWidgetFloat,
  className
}: SingleColumnWidgetLayoutProps) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [screenWidth, setScreenWidth] = useState<number>(1200);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<number | null>(null);
  const [isOverColumn, setIsOverColumn] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle window resize with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreenWidth(window.innerWidth);
      }, 100);
    };

    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  // Calculate responsive grid dimensions
  const gridDimensions = useMemo(() => {
    // More compact base dimensions that work well in smaller spaces
    let baseCellSize = 60;
    let baseGap = 6;
    let basePadding = 8;
    
    // Responsive adjustments based on screen size
    if (screenWidth >= 1200) {
      baseCellSize = 80;
      baseGap = 8;
      basePadding = 12;
    } else if (screenWidth >= 768) {
      baseCellSize = 70;
      baseGap = 6;
      basePadding = 10;
    } else {
      baseCellSize = 60;
      baseGap = 4;
      basePadding = 8;
    }
    
    return {
      cellSize: baseCellSize,
      gap: baseGap,
      padding: basePadding,
      totalWidth: baseCellSize + baseGap,
      minHeight: Math.max(300, GRID_CONFIG.rows * baseCellSize + (GRID_CONFIG.rows - 1) * baseGap + basePadding * 2)
    };
  }, [screenWidth]);

  // Get column boundary based on screen size
  const getColumnBoundary = useCallback(() => {
    const dashboard = document.querySelector('[data-dashboard-layout]') as HTMLElement;
    if (!dashboard) return { left: 0, right: 0 };
    
    const dashboardRect = dashboard.getBoundingClientRect();
    
    // Calculate responsive column width
    let columnWidth;
    if (dashboardRect.width >= 1024) {
      columnWidth = dashboardRect.width * 0.33;
    } else if (dashboardRect.width >= 768) {
      columnWidth = dashboardRect.width * 0.4;
    } else {
      columnWidth = dashboardRect.width * 0.5;
    }
    
    return {
      left: dashboardRect.left,
      right: dashboardRect.left + columnWidth
    };
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, widget: WidgetInstance) => {
    setDraggedWidget(widget.id);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
    e.dataTransfer.setData('text/plain', widget.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Track the original index of the dragged widget
    const columnWidgets = widgets.filter(w => !w.isFloating);
    const originalIndex = columnWidgets.findIndex(w => w.id === widget.id);
    setDraggedWidgetIndex(originalIndex);
    
    // Set cursor to indicate dragging
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
  }, [widgets]);

  // Handle drag over with improved logic
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedWidget || !containerRef.current) return;
    
    // Track drag position for visual feedback
    setDragPosition({ x: e.clientX, y: e.clientY });
    
    // Get column boundary
    const columnBoundary = getColumnBoundary();
    
    // Check if within column bounds for reordering
    const isWithinColumn = e.clientX <= columnBoundary.right;
    setIsOverColumn(isWithinColumn);
    
    if (isWithinColumn) {
      setIsReordering(true);
      
      // Calculate drop target index
      const targetIndex = calculateDropTarget(e.clientY);
      setDropTargetIndex(targetIndex);
    } else {
      setIsReordering(false);
      setDropTargetIndex(null);
    }
  }, [draggedWidget, getColumnBoundary]);

  // Handle drop with simplified logic
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedWidget || !dragStartPosition) return;
    
    // Get column boundary
    const columnBoundary = getColumnBoundary();
    
    // Check if dragged outside the column area
    const isOutsideColumn = e.clientX > columnBoundary.right;
    
    if (isOutsideColumn && onMakeWidgetFloat) {
      // Pop out the widget - use absolute position relative to dashboard
      const dashboard = document.querySelector('[data-dashboard-layout]') as HTMLElement;
      if (dashboard) {
        const dashboardRect = dashboard.getBoundingClientRect();
        const relativeX = e.clientX - dashboardRect.left;
        const relativeY = e.clientY - dashboardRect.top;
        onMakeWidgetFloat(draggedWidget, { x: relativeX, y: relativeY });
      }
    } else if (isReordering && dropTargetIndex !== null && onReorderColumnWidgets) {
      // Reorder within the column
      onReorderColumnWidgets(draggedWidget, dropTargetIndex);
    }
    
    // Reset all drag states
    resetDragState();
  }, [draggedWidget, dragStartPosition, getColumnBoundary, onMakeWidgetFloat, isReordering, dropTargetIndex, onReorderColumnWidgets]);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Reset cursor
    (e.currentTarget as HTMLElement).style.cursor = '';
    
    // Reset all drag states
    resetDragState();
  }, []);

  // Reset drag state
  const resetDragState = useCallback(() => {
    setDraggedWidget(null);
    setDragStartPosition(null);
    setDragPosition(null);
    setDropTargetIndex(null);
    setIsReordering(false);
    setDraggedWidgetIndex(null);
    setIsOverColumn(false);
  }, []);

  // Check if widget should pop out based on current drag position
  const shouldPopOut = useCallback((widgetId: string) => {
    if (!dragPosition || draggedWidget !== widgetId) return false;
    
    const columnBoundary = getColumnBoundary();
    return dragPosition.x > columnBoundary.right;
  }, [dragPosition, draggedWidget, getColumnBoundary]);

  // Filter widgets that are not floating and sort by position
  const columnWidgets = useMemo(() => 
    widgets
      .filter(w => !w.isFloating)
      .sort((a, b) => a.position.y - b.position.y),
    [widgets]
  );

  // Calculate reordered widget positions for visual feedback
  const getReorderedWidgets = useCallback(() => {
    if (!isReordering || dropTargetIndex === null || draggedWidgetIndex === null) {
      return columnWidgets;
    }

    const reordered = [...columnWidgets];
    const [draggedItem] = reordered.splice(draggedWidgetIndex, 1);
    
    // Adjust target index if dragging from before the target
    const adjustedTargetIndex = draggedWidgetIndex < dropTargetIndex ? dropTargetIndex - 1 : dropTargetIndex;
    reordered.splice(adjustedTargetIndex, 0, draggedItem);
    
    return reordered;
  }, [isReordering, dropTargetIndex, draggedWidgetIndex, columnWidgets]);

  // Get widget component
  const getWidgetComponent = useCallback((widget: WidgetInstance) => {
    const WidgetComponent = WIDGET_COMPONENTS[widget.widgetId as keyof typeof WIDGET_COMPONENTS];
    if (!WidgetComponent) {
      console.warn(`[SingleColumnWidgetLayout] Widget component not found for: ${widget.widgetId}`);
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Widget not found: {widget.widgetId}</p>
        </div>
      );
    }
    
    try {
      return (
        <WidgetComponent
          widget={widget}
          conversation={conversation}
          actions={actions}
          state={state}
          onRemoveWidget={onRemoveWidget}
          onMakeWidgetFloat={onMakeWidgetFloat}
          className="w-full h-full"
        />
      );
    } catch (error) {
      console.error(`[SingleColumnWidgetLayout] Error rendering widget ${widget.widgetId}:`, error);
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Error loading widget: {widget.widgetId}</p>
          <p className="text-xs">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      );
    }
  }, [conversation, actions, state, onRemoveWidget, onMakeWidgetFloat]);

  // Calculate widget dimensions based on size and screen
  const getWidgetDimensions = useCallback((size: string) => {
    const [width, height] = size.split('x').map(Number);
    let baseHeight = height * gridDimensions.cellSize + (height - 1) * gridDimensions.gap;
    
    // Make widgets more compact but ensure contact widget has enough space
    if (height === 1) {
      baseHeight = Math.max(120, baseHeight); // Increased minimum height for single row widgets (like contact)
    } else if (height === 2) {
      baseHeight = Math.max(160, baseHeight); // Minimum height for double row widgets
    } else if (height === 3) {
      baseHeight = Math.max(200, baseHeight); // Minimum height for triple row widgets
    }
    
    // Add responsive adjustments - make widgets more compact on smaller screens
    let responsiveHeight = baseHeight;
    if (screenWidth < 768) {
      responsiveHeight = Math.max(100, baseHeight * 0.9); // Slightly smaller on mobile but still usable
    } else if (screenWidth >= 1200) {
      responsiveHeight = Math.max(120, baseHeight); // Full size on large screens
    }
    
    return {
      width: '100%',
      height: Math.min(responsiveHeight, 250), // Increased cap maximum height
      gridWidth: width,
      gridHeight: height,
      minHeight: Math.max(80, responsiveHeight * 0.8) // Minimum viable height
    };
  }, [gridDimensions, screenWidth]);

  // Calculate drop target index with improved logic
  const calculateDropTarget = useCallback((mouseY: number) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return columnWidgets.length;
    
    const relativeY = mouseY - containerRect.top;
    let accumulatedHeight = 0;
    const gap = 12;
    
    for (let i = 0; i < columnWidgets.length; i++) {
      const widget = columnWidgets[i];
      const dimensions = getWidgetDimensions(widget.config.size);
      
      // Check if mouse is before this widget
      if (relativeY < accumulatedHeight + dimensions.height / 2) {
        return i;
      }
      
      accumulatedHeight += dimensions.height + gap;
    }
    
    // If we're past all widgets, drop at the end
    return columnWidgets.length;
  }, [columnWidgets, getWidgetDimensions]);

  // Calculate drop zone position
  const calculateDropZonePosition = useCallback((index: number) => {
    let accumulatedHeight = 0;
    const gap = 12;
    
    for (let i = 0; i < index; i++) {
      const widget = columnWidgets[i];
      const dimensions = getWidgetDimensions(widget.config.size);
      accumulatedHeight += dimensions.height + gap;
    }
    
    return accumulatedHeight;
  }, [columnWidgets, getWidgetDimensions]);

  // Calculate drop zone height based on dragged widget size
  const calculateDropZoneHeight = useCallback(() => {
    if (!draggedWidget) return 80;
    
    const widget = widgets.find(w => w.id === draggedWidget);
    if (!widget) return 80;
    
    const dimensions = getWidgetDimensions(widget.config.size);
    return dimensions.height;
  }, [draggedWidget, widgets, getWidgetDimensions]);

  return (
    <div className={cn("w-full h-full bg-card rounded-xl shadow-sm flex flex-col overflow-hidden", className)}>
      {/* Grid Container */}
      <div
        ref={containerRef}
        className="flex-1 bg-muted/10 rounded-lg m-2 p-2 overflow-hidden"
        style={{
          width: 'calc(100% - 1rem)',
          height: 'calc(100% - 1rem)',
          minHeight: Math.min(gridDimensions.minHeight, 400),
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Column Boundary Indicator - Only visible when dragging */}
        {draggedWidget && (
          <div 
            className={cn(
              "fixed top-0 w-1 pointer-events-none transition-opacity duration-300 z-40",
              "lg:left-[33.333%] md:left-[40%] left-[50%]",
              isOverColumn ? "bg-primary/60 opacity-80" : "bg-secondary/60 opacity-60"
            )}
            style={{ height: '100vh' }}
          />
        )}

        {/* Drop Zone Indicator - Simplified and more reliable */}
        {isReordering && dropTargetIndex !== null && draggedWidgetIndex !== null && (
          <div
            className="absolute left-0 right-0 h-2 bg-primary/60 rounded-full z-20 transition-all duration-200 shadow-lg"
            style={{
              top: `${calculateDropZonePosition(dropTargetIndex)}px`,
              transform: 'translateY(-50%)',
              boxShadow: '0 0 8px rgba(var(--primary), 0.4)'
            }}
          />
        )}

        {/* Widgets */}
        <div className="flex flex-col gap-2 w-full h-full overflow-y-auto overflow-x-hidden">
          {getReorderedWidgets().map((widget, index) => {
            const dimensions = getWidgetDimensions(widget.config.size);
            const isDragging = draggedWidget === widget.id;
            const willPopOut = shouldPopOut(widget.id);
            const isDropTarget = isReordering && dropTargetIndex === index;
            
            return (
              <div
                key={widget.id}
                className={cn(
                  "bg-card rounded-lg shadow-sm overflow-hidden flex-shrink-0",
                  "transition-all duration-300 ease-out cursor-grab active:cursor-grabbing",
                  isDragging && "opacity-50 scale-95 shadow-lg rotate-1",
                  !isDragging && "hover:shadow-md hover:scale-[1.02]",
                  willPopOut && "border-secondary shadow-lg",
                  isDropTarget && "border-primary/40 bg-primary/5 ring-2 ring-primary/20",
                  isReordering && !isDragging && !isDropTarget && "opacity-60"
                )}
                style={{
                  height: Math.min(dimensions.height, 200), // Limit max height
                  minHeight: Math.max(dimensions.minHeight, 80), // Ensure minimum height
                  zIndex: isDragging ? 10 : isDropTarget ? 5 : 1,
                  transform: isDragging 
                    ? 'scale(0.95) rotate(1deg)' 
                    : isDropTarget 
                    ? 'scale(1.02)' 
                    : 'scale(1)'
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, widget)}
                onDragEnd={handleDragEnd}
              >
                {/* Widget Content */}
                <div className="p-2 bg-background/80 h-full overflow-hidden">
                  {getWidgetComponent(widget)}
                </div>
                
                {/* Drop target glow */}
                {isDropTarget && (
                  <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none animate-pulse" 
                       style={{ boxShadow: '0 0 20px rgba(var(--primary), 0.3)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Widget Button */}
      <div className="p-2 flex justify-center flex-shrink-0">
        <button
          onClick={onAddWidget}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Widget</span>
        </button>
      </div>

      {/* Pop Out Indicator - Simplified */}
      {draggedWidget && shouldPopOut(draggedWidget) && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-secondary/10 border-2 border-dashed border-secondary/40 rounded-lg m-4 flex items-center justify-center">
            <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                <span className="text-sm font-medium">Release to float widget</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag Mode Indicator - Simplified */}
      {draggedWidget && (
        <div className="fixed top-4 right-4 pointer-events-none z-50">
          <div className={cn(
            "px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-200",
            isReordering 
              ? "bg-primary text-primary-foreground" 
              : shouldPopOut(draggedWidget)
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            <div className="flex items-center gap-2">
              {isReordering ? (
                <>
                  <Move className="w-4 h-4" />
                  <span>Release to reorder</span>
                </>
              ) : shouldPopOut(draggedWidget) ? (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Release to float widget</span>
                </>
              ) : (
                <>
                  <Move className="w-4 h-4" />
                  <span>Drag to reorder or float</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 