/**
 * Widget Wrapper Component
 * Provides consistent styling and structure for all widgets
 */

import React from 'react';
import { cn } from '@/lib/utils/utils';
import type { WidgetSize } from '@/types/widgets';

interface WidgetWrapperProps {
  children: React.ReactNode;
  size: WidgetSize;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  onToggle?: () => void;
  isExpanded?: boolean;
  showToggle?: boolean;
}

export function WidgetWrapper({
  children,
  size,
  className,
  title,
  icon,
  onToggle,
  isExpanded = true,
  showToggle = false
}: WidgetWrapperProps) {
  const sizeClasses = {
    '1x1': 'col-span-1 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '1x3': 'col-span-1 row-span-3',
    '1x4': 'col-span-1 row-span-4'
  };

  return (
    <div className={cn(
      "bg-card border-2 border-border/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden",
      sizeClasses[size],
      className
    )}>
      {/* Header */}
      {(title || showToggle) && (
        <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/60">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-4 h-4 text-muted-foreground">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
            )}
          </div>
          {showToggle && onToggle && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <svg
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded ? "rotate-180" : ""
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3 bg-background/80">
        {isExpanded ? children : null}
      </div>
    </div>
  );
} 