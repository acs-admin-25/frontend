/**
 * Widget Layout Hook
 * Manages widget layout state and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_WIDGET_LAYOUT, getWidgetById } from '@/lib/utils/widgets';
import { WidgetInstance } from '../types/widgets';

const WIDGET_LAYOUT_KEY = 'conversation-widget-layout';

// Single column grid configuration - matches SingleColumnWidgetLayout
const GRID_CONFIG = {
  columns: 1,
  rows: 4,
  cellSize: 120,
  gap: 12,
};

export function useWidgetLayout() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load widget layout from localStorage
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(WIDGET_LAYOUT_KEY);
      if (savedLayout) {
        const parsedWidgets = JSON.parse(savedLayout);
        
        // Validate and fix corrupted widget data
        const validatedWidgets = parsedWidgets.map((widget: any) => {
          if (!widget || !widget.widgetId) return null;
          
          const config = getWidgetById(widget.widgetId);
          if (!config) {
            console.warn(`Widget config not found for: ${widget.widgetId}`);
            return null;
          }
          
          // Fix corrupted widget names by using the config
          return {
            ...widget,
            config: {
              ...config,
              name: config.name // Ensure name is correct from config
            }
          };
        }).filter(Boolean) as WidgetInstance[];
        
        setWidgets(validatedWidgets);
      } else {
        // Start with no widgets by default
        setWidgets([]);
      }
    } catch (error) {
      console.error('Failed to load widget layout:', error);
      setWidgets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save widget layout to localStorage
  const saveLayout = useCallback((newWidgets: WidgetInstance[]) => {
    try {
      localStorage.setItem(WIDGET_LAYOUT_KEY, JSON.stringify(newWidgets));
    } catch (error) {
      console.error('Failed to save widget layout:', error);
    }
  }, []);

  // Add widget to layout
  const addWidget = useCallback((widgetId: string) => {
    const config = getWidgetById(widgetId);
    if (!config) {
      console.warn(`Widget config not found for: ${widgetId}`);
      return;
    }

    // For flex column layout, just add widgets at the end
    const newPosition = { x: 0, y: widgets.length };

    const newWidget: WidgetInstance = {
      id: `${widgetId}-${Date.now()}`,
      widgetId,
      config,
      position: newPosition,
      isVisible: true,
      isFloating: false,
      settings: {}
    };

    const newWidgets = [...widgets, newWidget];
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Remove widget from layout
  const removeWidget = useCallback((widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Reorder widgets
  const reorderWidgets = useCallback((newWidgets: WidgetInstance[]) => {
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [saveLayout]);

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    );
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Update widget settings
  const updateWidgetSettings = useCallback((widgetId: string, settings: Record<string, any>) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, settings: { ...w.settings, ...settings } } : w
    );
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    const defaultWidgets = DEFAULT_WIDGET_LAYOUT.map((widgetId, index) => {
      const config = getWidgetById(widgetId);
      if (!config) return null;
      return {
        id: `${widgetId}-${index}`,
        widgetId,
        config,
        position: { x: 0, y: index }, // Single column: x always 0, y increments
        isVisible: true,
        isFloating: false,
        settings: {}
      };
    }).filter(Boolean) as WidgetInstance[];
    
    setWidgets(defaultWidgets);
    saveLayout(defaultWidgets);
  }, [saveLayout]);

  // Clear all widgets
  const clearAllWidgets = useCallback(() => {
    setWidgets([]);
    saveLayout([]);
  }, [saveLayout]);

  // Clear corrupted data and reset to default
  const clearCorruptedData = useCallback(() => {
    try {
      localStorage.removeItem(WIDGET_LAYOUT_KEY);
      resetToDefault();
    } catch (error) {
      console.error('Failed to clear corrupted widget data:', error);
      resetToDefault();
    }
  }, [resetToDefault]);

  // Move widget to new grid position
  const moveWidget = useCallback((widgetId: string, newPosition: { x: number; y: number }) => {
    // For flex column layout, just update the y position
    const position = { x: 0, y: newPosition.y };
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, position, isFloating: false } : w
    );
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Update widget position (for floating widgets)
  const updateFloatingWidgetPosition = useCallback((widgetId: string, position: { x: number; y: number }) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, position, isFloating: true } : w
    );
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Make widget float (drag out of column)
  const makeWidgetFloat = useCallback((widgetId: string, position: { x: number; y: number }) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, position, isFloating: true } : w
    );
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Return widget to column
  const returnWidgetToColumn = useCallback((widgetId: string) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, isFloating: false } : w
    );
    setWidgets(newWidgets);
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Reorder widgets within column (for drag and drop reordering)
  const reorderColumnWidgets = useCallback((draggedWidgetId: string, targetIndex: number) => {
    const columnWidgets = widgets.filter(w => !w.isFloating);
    const draggedIndex = columnWidgets.findIndex(w => w.id === draggedWidgetId);
    
    if (draggedIndex === -1) return;
    
    // Create new array with reordered widgets
    const newColumnWidgets = [...columnWidgets];
    const [draggedWidgetItem] = newColumnWidgets.splice(draggedIndex, 1);
    
    // Adjust target index if dragging from before the target
    const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    newColumnWidgets.splice(adjustedTargetIndex, 0, draggedWidgetItem);
    
    // Update positions for all widgets
    const updatedWidgets = widgets.map(widget => {
      if (widget.isFloating) return widget;
      
      const newIndex = newColumnWidgets.findIndex(w => w.id === widget.id);
      if (newIndex !== -1) {
        return { ...widget, position: { x: 0, y: newIndex } };
      }
      return widget;
    });
    
    setWidgets(updatedWidgets);
    saveLayout(updatedWidgets);
  }, [widgets, saveLayout]);

  return {
    widgets,
    isLoading,
    addWidget,
    removeWidget,
    reorderWidgets,
    reorderColumnWidgets,
    toggleWidgetVisibility,
    updateWidgetSettings,
    resetToDefault,
    clearAllWidgets,
    clearCorruptedData,
    moveWidget,
    updateWidgetPosition: updateFloatingWidgetPosition,
    makeWidgetFloat,
    returnWidgetToColumn
  };
} 