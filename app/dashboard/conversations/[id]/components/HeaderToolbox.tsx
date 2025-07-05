/**
 * Header Toolbox Component
 * Provides widget management tools in the conversation header
 * Similar to Google Docs toolbar functionality
 */

import React, { useState } from 'react';
import { Plus, Grid3X3, Settings, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { WidgetInstance } from '@/types/widgets';

interface HeaderToolboxProps {
  widgets: WidgetInstance[];
  onAddWidget: () => void;
  onRemoveWidget: (widgetId: string) => void;
  onToggleWidgetVisibility: (widgetId: string) => void;
  className?: string;
}

export function HeaderToolbox({
  widgets,
  onAddWidget,
  onRemoveWidget,
  onToggleWidgetVisibility,
  className
}: HeaderToolboxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWidgets = widgets.filter(widget =>
    widget.config.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("relative", className)}>
      {/* Toolbox Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
          "bg-muted/60 hover:bg-muted border border-border/40",
          isExpanded && "bg-primary/10 border-primary/40 text-primary"
        )}
        title="Widget Toolbox"
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="text-sm font-medium">Widgets</span>
        <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded">
          {widgets.length}
        </span>
      </button>

      {/* Expanded Toolbox */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-card border-2 border-border/60 rounded-xl shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Widget Toolbox</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-background border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>
          </div>

          {/* Widget List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredWidgets.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No widgets found' : 'No widgets added'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/60 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        <Grid3X3 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {widget.config.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {widget.config.size} • {widget.config.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleWidgetVisibility(widget.id)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          widget.isVisible 
                            ? "text-status-success hover:bg-status-success/10" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                        title={widget.isVisible ? 'Hide Widget' : 'Show Widget'}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          widget.isVisible ? "bg-status-success" : "bg-muted-foreground/30"
                        )} />
                      </button>
                      <button
                        onClick={() => onRemoveWidget(widget.id)}
                        className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Remove Widget"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Widget Button */}
          <div className="p-3 border-t border-border/40">
            <button
              onClick={() => {
                onAddWidget();
                setIsExpanded(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add New Widget
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
} 