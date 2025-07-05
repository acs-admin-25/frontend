'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/app/dashboard/components/navigation/Sidebar';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

// Import navigation data from the Sidebar component
import { navigationGroups } from '@/app/dashboard/components/navigation/Sidebar';

  // this is dead code

interface MobileNavigationDropdownProps {
  children?: React.ReactNode;
}

export function MobileNavigationDropdown({ children }: MobileNavigationDropdownProps) {
  const { isMobile, toggle } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Main']));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle);
      } else {
        newSet.add(groupTitle);
      }
      return newSet;
    });
  };

  const handleItemClick = () => {
    setIsOpen(false);
    toggle();
  };

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div 
            ref={dropdownRef}
            className="absolute top-16 left-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[calc(100vh-8rem)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Navigation Groups */}
            <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
              {navigationGroups.map((group: any) => {
                const isExpanded = expandedGroups.has(group.title);
                const GroupIcon = group.icon;
                
                return (
                  <div key={group.title} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <GroupIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{group.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    
                    <div className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="pb-2">
                        {group.items.map((item: any) => {
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.title}
                              onClick={handleItemClick}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                            >
                              <ItemIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{item.title}</span>
                                <span className="text-xs text-gray-500">{item.description}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                © 2025 ACS. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 