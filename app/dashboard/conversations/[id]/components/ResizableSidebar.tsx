import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/utils';
import { X } from 'lucide-react';

interface ResizableSidebarProps {
  position: 'left' | 'right';
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  className?: string;
}

export function ResizableSidebar({
  position,
  isExpanded,
  onToggle,
  children,
  minWidth = 240,
  maxWidth = 400,
  defaultWidth = 320,
  className
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = position === 'left' 
      ? e.clientX - startXRef.current 
      : startXRef.current - e.clientX;
    
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    setWidth(newWidth);
  }, [isResizing, position, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Reset width when sidebar is collapsed
  useEffect(() => {
    if (!isExpanded) {
      setWidth(defaultWidth);
    }
  }, [isExpanded, defaultWidth]);

  if (!isExpanded) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "relative flex flex-col bg-card border border-border shadow-sm overflow-hidden",
        "transition-all duration-300 ease-in-out",
        className
      )}
      style={{ width: `${width}px` }}
    >
      {/* Close button - Google Docs Style */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-20",
          position === 'left' ? "right-3" : "left-3"
        )}
        title="Close panel"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Resize handle - Google Docs Style */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-primary/20 transition-colors",
          "flex items-center justify-center",
          position === 'left' ? '-right-0.5' : '-left-0.5'
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="w-0.5 h-8 bg-border rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
} 