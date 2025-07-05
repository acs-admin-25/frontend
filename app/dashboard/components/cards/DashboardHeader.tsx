import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { RefreshCw, Settings, Bell, User, ChevronDown } from 'lucide-react';
import { DashboardSettingsPanel, useDashboardSettings } from './DashboardSettings';
import { DateRangePicker } from './DateRangePicker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import { DateRange } from 'react-day-picker';

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ 
  onRefresh, 
  isRefreshing = false,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const { settings, updateSettings } = useDashboardSettings();
  const userName = session?.user?.name || 'User';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDateChange = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      updateSettings({ dateRange, timeRange: 'custom' });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Close dropdown when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showUserMenu]);

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Welcome back, {userName}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Date Range Picker */}
          <DateRangePicker
            date={settings.dateRange}
            onDateChange={handleDateChange}
          />
          
          {/* Notification Bell */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-status-error rounded-full"></span>
          </button>
          
          {/* Settings Panel */}
          <DashboardSettingsPanel />
          
          {/* Refresh Button with Loading State */}
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="secondary"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </Button>
          
          {/* User Menu */}
          <div className="relative">
            <button 
              ref={buttonRef}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <User className="h-5 w-5" />
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 sm:w-56 md:w-60 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200 max-w-[calc(100vw-2rem)]" ref={dropdownRef}>
                <div className="px-3 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm leading-none">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <a href="/dashboard/settings" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group">
                    <Settings className="h-4 w-4 mr-2.5 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                    <span className="truncate">Settings</span>
                  </a>
                  <a href="/dashboard/profile" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group">
                    <User className="h-4 w-4 mr-2.5 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                    <span className="truncate">Profile</span>
                  </a>
                  <div className="border-t border-gray-100 my-1"></div>
                  <a href="/api/auth/signout" className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group">
                    <svg className="h-4 w-4 mr-2.5 text-red-400 group-hover:text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="truncate">Sign Out</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 