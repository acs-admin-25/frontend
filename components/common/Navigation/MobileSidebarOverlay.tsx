'use client';

import React from 'react';
import { useSidebar } from '@/app/dashboard/components/navigation/Sidebar';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface MobileSidebarOverlayProps {
  children: React.ReactNode;
}

export function MobileSidebarOverlay({ children }: MobileSidebarOverlayProps) {
  const { isOpen, isMobile, toggle } = useSidebar();

  if (!isMobile || !isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={toggle}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-gradient-to-b from-[#0a5a2f] via-[#0e6537] to-[#157a42] border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <button
            onClick={toggle}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
} 