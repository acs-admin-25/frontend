import React from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Sun,
  Moon,
  Coffee,
  Users,
  Target,
  RefreshCw,
  Settings,
  Bell,
  User,
  ChevronDown,
  Palette,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useDashboardSettings, DashboardSettingsPanel } from './DashboardSettings';
import { cn } from '@/lib/utils/utils';
import { useSimpleTheme } from '@/lib/theme/simple-theme-provider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface DashboardHeaderProps {
  activeLeads?: number;
  newMessages?: number;
  conversionRate?: number;
}

export function DashboardHeader({ 
  activeLeads = 0, 
  newMessages = 0, 
  conversionRate = 0 
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'User';
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');
  const { currentTheme, switchToGreen, switchToBlue } = useSimpleTheme();
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const availableThemes = [
    {
      value: 'green',
      label: 'Green & White',
      description: 'Clean and professional green theme',
      gradient: 'linear-gradient(135deg, #288e41, #10b981, #047857)'
    },
    {
      value: 'blue',
      label: 'Blue & White',
      description: 'Modern and trustworthy blue theme',
      gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #1e40af)'
    }
  ];
  const currentThemeValue = currentTheme.name === 'Green & White' ? 'green' : 'blue';
  const handleThemeSelect = (themeName: string) => {
    if (themeName === 'green') {
      switchToGreen();
    } else if (themeName === 'blue') {
      switchToBlue();
    }
    setShowColorPicker(false);
  };

  // Time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good morning', icon: <Sun className="h-5 w-5 text-text-on-gradient" /> };
    if (hour < 17) return { greeting: 'Good afternoon', icon: <Coffee className="h-5 w-5 text-text-on-gradient" /> };
    return { greeting: 'Good evening', icon: <Moon className="h-5 w-5 text-text-on-gradient" /> };
  };
  const { greeting, icon } = getTimeBasedGreeting();

  return (
    <div
      className={cn(
        'mb-8 min-h-[200px] p-2 sm:p-4 md:p-6 rounded-2xl shadow-xl border border-secondary/20 mt-6 relative overflow-x-hidden',
        'px-4 sm:px-6',
        'bg-gradient-to-br',
        currentThemeValue === 'green'
          ? 'from-green-600 via-green-500 to-green-400'
          : 'from-blue-600 via-blue-500 to-blue-400'
      )}
    >
      {/* Desktop: Icons in top right */}
      <div className="hidden lg:flex absolute top-4 right-4 flex-row items-center gap-3 z-10">
        {/* Color Picker Icon */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="p-1 rounded-full border border-white/60 bg-transparent hover:bg-white/10"
              aria-label="Pick theme color"
              type="button"
            >
              <Palette className="h-5 w-5 text-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-0 border border-border bg-white rounded-lg shadow-lg max-h-56 overflow-auto flex flex-col gap-1 min-w-[13rem]">
            {availableThemes.map(theme => (
              <button
                key={theme.value}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md transition-colors w-full',
                  currentThemeValue === theme.value ? 'ring-2 ring-primary' : 'hover:bg-muted'
                )}
                onClick={() => handleThemeSelect(theme.value)}
                type="button"
              >
                <span className="w-8 h-8 rounded-full border border-border flex-shrink-0" style={{background: theme.gradient}}></span>
                <span className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-base font-medium text-foreground truncate">{theme.label}</span>
                  <span className="text-xs text-muted-foreground truncate">{theme.description}</span>
                </span>
                {currentThemeValue === theme.value && (
                  <Check className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        {/* Notification Bell */}
        <button className="relative p-1 rounded-full border border-white/60 bg-transparent hover:bg-white/10">
          <Bell className="h-5 w-5 text-white" />
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-status-error rounded-full"></span>
        </button>
        {/* Settings Icon */}
        <Link href="/dashboard/settings" className="p-1 rounded-full border border-white/60 bg-transparent hover:bg-white/10">
          <Settings className="h-5 w-5 text-white" />
        </Link>
        {/* Profile Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center p-0.5 rounded-full border-2 border-white/60 bg-white"
              aria-label="Open profile menu"
              type="button"
            >
              <User className="h-7 w-7 text-secondary" />
              <ChevronDown className="h-4 w-4 ml-1 text-secondary" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-0 bg-white rounded-lg shadow-lg border border-border z-50">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium text-popover-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <div className="py-1">
              <a href="/dashboard/settings" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">
                Settings
              </a>
              <a href="/dashboard/profile" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">
                Profile
              </a>
              <a href="/api/auth/signout" className="block px-4 py-2 text-sm text-status-error hover:bg-accent">
                Sign Out
              </a>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="flex flex-col lg:hidden">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            {icon}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-on-gradient leading-tight">
              {greeting}, {userName}!
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-text-on-gradient opacity-95 mb-1 sm:mb-2 leading-relaxed">
            Here's your real estate performance snapshot for today
          </p>
          <p className="text-text-on-gradient opacity-90 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{currentDate}</span>
          </p>
        </div>
        
        {/* Mobile Icons */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
          {/* Color Picker Icon */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-1 rounded-full border border-white/60 bg-transparent hover:bg-white/10"
                aria-label="Pick theme color"
                type="button"
              >
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 sm:w-56 p-0 border border-border bg-white rounded-lg shadow-lg max-h-56 overflow-auto flex flex-col gap-1 min-w-[12rem] sm:min-w-[13rem]">
              {availableThemes.map(theme => (
                <button
                  key={theme.value}
                  className={cn(
                    'flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-md transition-colors w-full',
                    currentThemeValue === theme.value ? 'ring-2 ring-primary' : 'hover:bg-muted'
                  )}
                  onClick={() => handleThemeSelect(theme.value)}
                  type="button"
                >
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-border flex-shrink-0" style={{background: theme.gradient}}></span>
                  <span className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-sm sm:text-base font-medium text-foreground truncate">{theme.label}</span>
                    <span className="text-xs text-muted-foreground truncate">{theme.description}</span>
                  </span>
                  {currentThemeValue === theme.value && (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          {/* Notification Bell */}
          <button className="relative p-1 rounded-full border border-white/60 bg-transparent hover:bg-white/10">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-status-error rounded-full"></span>
          </button>
          {/* Settings Icon */}
          <Link href="/dashboard/settings" className="p-1 rounded-full border border-white/60 bg-transparent hover:bg-white/10">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </Link>
          {/* Profile Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center p-0.5 rounded-full border-2 border-white/60 bg-white"
                aria-label="Open profile menu"
                type="button"
              >
                <User className="h-5 w-5 sm:h-7 sm:w-7 text-secondary" />
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5 sm:ml-1 text-secondary" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 sm:w-48 p-0 bg-white rounded-lg shadow-lg border border-border z-50">
              <div className="px-3 sm:px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-popover-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <div className="py-1">
                <a href="/dashboard/settings" className="block px-3 sm:px-4 py-2 text-sm text-popover-foreground hover:bg-accent">
                  Settings
                </a>
                <a href="/dashboard/profile" className="block px-3 sm:px-4 py-2 text-sm text-popover-foreground hover:bg-accent">
                  Profile
                </a>
                <a href="/api/auth/signout" className="block px-3 sm:px-4 py-2 text-sm text-status-error hover:bg-accent">
                  Sign Out
                </a>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Desktop: Content area */}
      <div className="hidden lg:block flex-1 min-w-0 pr-20">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <h1 className="text-5xl font-bold text-text-on-gradient leading-tight">
            {greeting}, {userName}!
          </h1>
        </div>
        <p className="text-xl text-text-on-gradient opacity-95 mb-2 leading-relaxed">
          Here's your real estate performance snapshot for today
        </p>
        <p className="text-text-on-gradient opacity-90 flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{currentDate}</span>
        </p>
      </div>
    </div>
  );
} 