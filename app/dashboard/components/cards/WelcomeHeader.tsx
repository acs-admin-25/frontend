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
import { useDashboardSettings, DashboardSettingsPanel } from '@/app/dashboard/components/dashboard/DashboardSettings';
import { cn } from '@/lib/utils/utils';
import { useSimpleTheme } from '@/lib/theme/simple-theme-provider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface WelcomeHeaderProps {
  activeLeads?: number;
  newMessages?: number;
  conversionRate?: number;
}

export function WelcomeHeader({ 
  activeLeads = 0, 
  newMessages = 0, 
  conversionRate = 0 
}: WelcomeHeaderProps) {
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
        'mb-8 max-w-screen-2xl mx-auto min-h-[200px] p-2 sm:p-4 md:p-6 rounded-2xl shadow-xl border border-secondary/20 mt-6 relative overflow-x-hidden',
        'px-4 sm:px-6 md:px-8',
        'mx-2 sm:mx-4 md:mx-6',
        'bg-gradient-to-br',
        currentThemeValue === 'green'
          ? 'from-green-600 via-green-500 to-green-400'
          : 'from-blue-600 via-blue-500 to-blue-400'
      )}
    >
      <div className="absolute top-4 right-4 flex flex-row items-center gap-3 z-10">
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
                <span className="w-8 h-8 rounded-full border border-border" style={{background: theme.gradient}}></span>
                <span className="flex flex-col text-left">
                  <span className="text-base font-medium text-foreground">{theme.label}</span>
                  <span className="text-xs text-muted-foreground">{theme.description}</span>
                </span>
                {currentThemeValue === theme.value && (
                  <Check className="h-5 w-5 text-primary ml-auto" />
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
              <p className="text-sm font-medium text-popover-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon}
            <h1 className="text-4xl lg:text-5xl font-bold text-text-on-gradient">
              {greeting}, {userName}!
            </h1>
          </div>
          <p className="text-xl text-text-on-gradient opacity-95 mb-2">
            Here's your real estate performance snapshot for today
          </p>
          <p className="text-text-on-gradient opacity-90 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {currentDate}
          </p>
        </div>
      </div>
    </div>
  );
} 