import React from 'react';
import { cn } from '@/lib/utils/utils';

interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard' | 'auth' | 'page';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function LayoutContainer({
  children,
  className,
  variant = 'default',
  padding = 'md',
  maxWidth = 'full'
}: LayoutContainerProps) {
  const variantClasses = {
    default: 'min-h-screen bg-gray-50 dark:bg-gray-900',
    dashboard: 'h-full bg-gray-50 dark:bg-gray-900',
    auth: 'min-h-screen bg-gradient-to-br from-[#f0f9f4] to-[#e6f5ec]',
    page: 'min-h-screen bg-white dark:bg-gray-900'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const maxWidthClasses = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      variantClasses[variant],
      className
    )}>
      <div className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding]
      )}>
        {children}
      </div>
    </div>
  );
}

interface LayoutContentProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function LayoutContent({
  children,
  className,
  scrollable = true
}: LayoutContentProps) {
  return (
    <div className={cn(
      'flex-1',
      scrollable && 'overflow-y-auto overflow-x-hidden',
      className
    )}>
      {children}
    </div>
  );
}

interface LayoutHeaderProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function LayoutHeader({
  children,
  className,
  sticky = false
}: LayoutHeaderProps) {
  return (
    <header className={cn(
      'flex-shrink-0',
      sticky && 'sticky top-0 z-10',
      className
    )}>
      {children}
    </header>
  );
}

interface LayoutFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function LayoutFooter({
  children,
  className
}: LayoutFooterProps) {
  return (
    <footer className={cn(
      'flex-shrink-0',
      className
    )}>
      {children}
    </footer>
  );
} 