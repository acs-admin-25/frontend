/**
 * File: components/common/Navigation/Sidebar.tsx
 * Purpose: Optimized sidebar navigation with performance improvements
 * Author: Alejo Cagliolo
 * Date: 5/25/25
 * Version: 2.0.0
 */

"use client"
import React from "react"
import { Home, Mail, Users, MessageSquare, BarChart3, Settings, Phone, Calendar, PanelLeft, AlertTriangle, RefreshCw, ChevronDown, X, Shield, ShieldOff, FileText, Menu, Trash2, CreditCard, LogOut, ChevronLeft, ChevronRight, Clock, Copy } from "lucide-react"
import { useState, createContext, useContext, useEffect, useRef, useMemo, useCallback, memo } from "react"
import { useSession, signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { clearAuthData } from '@/lib/auth/auth-utils'
import { Logo } from "@/components/ui/Logo"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils/utils"
import { navigationGroups, type NavigationItem } from './SidebarData'
import { useAcsMail } from '@/lib/hooks/useAcsMail';
/**
 * SidebarContext
 * Context for managing sidebar state across components
 */
interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
  isMobile: false,
})

/**
 * useSidebar Hook
 * Custom hook to access sidebar context
 * @returns {Object} Sidebar context with isOpen state and toggle function
 */
function useSidebar() {
  return useContext(SidebarContext)
}

/**
 * SidebarProvider Component
 * Provides sidebar context to child components with optimized state management
 */
function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    if (mobile) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [checkMobile])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  const contextValue = useMemo(() => ({
    isOpen,
    toggle,
    isMobile
  }), [isOpen, toggle, isMobile])

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

/**
 * Sidebar Component
 * Main sidebar container with collapsible functionality
 */
const Sidebar = memo(function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile, toggle } = useSidebar()

  // Don't render sidebar on mobile - mobile menu is handled separately
  if (isMobile) {
    return null;
  }

  const handleClick = () => {
    if (!isOpen) {
      toggle();
    }
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 bg-[#288e41] border-r border-white/20 flex-shrink-0 shadow-xl h-full sidebar-transition',
        isOpen ? 'w-16 sm:w-20 md:w-64' : 'w-12 sm:w-16 md:w-28',
        !isOpen && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  )
})

/**
 * SidebarContent Component
 * Container for sidebar content with optimized rendering
 */
const SidebarContent = memo(function SidebarContent({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, isMobile } = useSidebar()
  const [screenSize, setScreenSize] = useState<'mobile' | 'sm' | 'md'>('md')

  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth
    if (width < 640) {
      setScreenSize('mobile')
    } else if (width < 768) {
      setScreenSize('sm')
    } else {
      setScreenSize('md')
    }
  }, [])

  useEffect(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [checkScreenSize])

  const logoSize = useMemo(() => {
    if (screenSize === 'mobile') return 'sm'
    if (screenSize === 'sm') return 'md'
    return 'lg'
  }, [screenSize])

  return (
    <div className="flex flex-col h-full max-h-full relative">
      {/* Header with logo and toggle */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-white/20">
        {/* Responsive Logo: show icon+text when open, icon-only when collapsed */}
        {isOpen ? (
          <Logo size={logoSize} variant="icon-only" whiteText href="/dashboard" />
        ) : (
          <div className="flex justify-center w-full">
            <Logo size={logoSize === 'lg' ? 'md' : 'sm'} variant="icon-only" href="/dashboard" />
          </div>
        )}
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              className="p-2 rounded-lg transition-colors group"
              title="Close sidebar"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          )}
          {!isMobile && isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              className="p-2 rounded-lg transition-colors group"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
})

/**
 * SidebarGroup Component
 * Groups related sidebar items with collapsible functionality
 */
const SidebarGroup = memo(function SidebarGroup({
  children,
  title,
  isExpanded,
  onToggle,
  onExpand,
  groupIcon: GroupIcon,
}: {
  children: React.ReactNode;
  title?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  groupIcon?: React.ComponentType<{ className?: string }>;
}) {
  const { isOpen, toggle: toggleSidebar } = useSidebar();

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleCollapsedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      toggleSidebar();
    }
    onExpand();
  };

  if (!isOpen) {
    return (
      <div className="px-2 py-2">
        <button
          onClick={handleCollapsedClick}
          className="w-full flex items-center justify-center p-2 text-white rounded-lg transition-colors group"
          title={title}
        >
          {GroupIcon && <GroupIcon className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 sidebar-group">
      {title && (
        <button
          onClick={handleHeaderClick}
          className="w-full flex items-center justify-between px-1 py-2 text-white transition-colors group"
        >
          <div className="flex items-center gap-2">
            {GroupIcon && <GroupIcon className="h-3 w-3" />}
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      )}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
})

/**
 * SidebarMenu Component
 * Container for sidebar menu items
 */
const SidebarMenu = memo(function SidebarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  )
})

/**
 * SidebarMenuItem Component
 * Individual menu item container
 */
const SidebarMenuItem = memo(function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="nav-item-hover">
      {children}
    </div>
  )
})

/**
 * Navigation Item Component
 * Individual navigation item with hover effects and active states
 */
interface NavigationItemProps {
  item: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    url: string;
    description: string;
  };
  unreadCount?: number;
}

const NavigationItem = memo(function NavigationItem({ item, unreadCount }: NavigationItemProps) {
  const { isOpen } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const isActive = pathname === item.url

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(item.url)
  }

  return (
    <SidebarMenuItem>
              <button
          onClick={handleClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative text-white"
          title={!isOpen ? item.title : undefined}
        >
        <div className="relative flex-shrink-0">
          <item.icon className="h-4 w-4 transition-transform text-white" />
          {unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {isOpen && (
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium truncate text-white">{item.title}</span>
            <span className="text-xs text-white/80 truncate">{item.description}</span>
          </div>
        )}
      </button>
    </SidebarMenuItem>
  )
})

/**
 * LogoutButton Component
 * Handles user logout functionality
 */
const LogoutButton = memo(function LogoutButton() {
  const { isOpen } = useSidebar()

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await clearAuthData()
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2 text-white rounded-lg transition-colors group"
      title="Logout"
    >
      <LogOut className="h-4 w-4 transition-transform" />
      {isOpen && <span className="text-sm font-medium">Logout</span>}
    </button>
  )
})

/**
 * User Profile Component
 * Displays user information in the sidebar
 */
interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const UserProfile = memo(function UserProfile({ user }: UserProfileProps) {
  const { isOpen } = useSidebar()
  // Removed useAcsMail and copy logic

  return (
    <SidebarGroup isExpanded={true} onToggle={() => {}} onExpand={() => {}}>
      <div className="flex items-center gap-3 p-3 rounded-lg">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {user.name
              ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
              : 'U'
            }
          </span>
        </div>
        {isOpen && (
          <div className="flex flex-col min-w-0">
            <span className="text-white font-medium text-sm truncate mb-0.5">{user.name || 'User'}</span>
            {/* ACS email removed */}
          </div>
        )}
      </div>
    </SidebarGroup>
  )
})

/**
 * Sidebar Footer Component
 * Footer section with links and copyright
 */
const SidebarFooter = memo(function SidebarFooter() {
  const { isOpen } = useSidebar()

  if (!isOpen) return null

  return (
    <div className="px-3 py-3 border-t border-white/20">
      <div className="flex flex-col gap-2 text-xs text-white/60">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="/legal/terms" className="text-white/80 transition-colors">Terms</a>
          <a href="/legal/privacy" className="text-white/80 transition-colors">Privacy</a>
          <a href="/legal/cookies" className="text-white/80 transition-colors">Cookies</a>
        </div>
        <span className="text-white/40 text-center">© 2025 ACS. All rights reserved.</span>
      </div>
    </div>
  )
})

/**
 * SidebarTrigger Component
 * Button to toggle sidebar visibility
 */
const SidebarTrigger = memo(function SidebarTrigger() {
  const { toggle, isMobile } = useSidebar()

  if (!isMobile) {
    return null
  }

  return (
    <button 
      onClick={toggle} 
      className="p-2 -ml-2 rounded-full transition-colors"
      aria-label="Toggle sidebar"
    >
      <Menu className="h-6 w-6 text-foreground" />
    </button>
  )
})

/**
 * AppSidebar Component
 * Main sidebar implementation with navigation and footer
 */
function AppSidebar() {
  const { data: session, status } = useSession() as { data: (Session & { user?: { id: string; name?: string | null; email?: string | null } }) | null, status: string };
  const [unreadSpamCount, setUnreadSpamCount] = useState(0);
  const mounted = useRef(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(navigationGroups[0]?.title || null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted.current || !session?.user?.id || status !== 'authenticated') return;

    const handleJunkEmailCountUpdate = (event: CustomEvent<number>) => {
      setUnreadSpamCount(event.detail);
    };

    window.addEventListener('junkEmailCountUpdated', handleJunkEmailCountUpdate as EventListener);

    return () => {
      window.removeEventListener('junkEmailCountUpdated', handleJunkEmailCountUpdate as EventListener);
    };
  }, [session?.user?.id, status]);

  const handleExpandGroup = (groupTitle: string) => {
    setExpandedGroup(groupTitle);
  };

  const handleToggleGroup = (groupTitle: string) => {
    setExpandedGroup(prev => (prev === groupTitle ? null : groupTitle));
  };

  const renderNavigationGroups = useMemo(() =>
    navigationGroups.map((group) => (
      <SidebarGroup
        key={group.title}
        title={group.title}
        groupIcon={group.icon}
        isExpanded={expandedGroup === group.title}
        onToggle={() => handleToggleGroup(group.title)}
        onExpand={() => handleExpandGroup(group.title)}
      >
        <SidebarMenu className="space-y-1 mt-2">
          {group.items.map(item => (
            <NavigationItem
              key={item.title}
              item={item}
              unreadCount={item.title === "Junk" ? unreadSpamCount : undefined}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )), [unreadSpamCount, expandedGroup]);

  return (
    <Sidebar>
      <SidebarContent>
        {/* Navigation groups */}
        <div className="flex-1 min-h-0">
          {renderNavigationGroups}
        </div>

        {/* User section - fixed at bottom */}
        <div className="flex-shrink-0">
          {session?.user && (
            <UserProfile user={session.user} />
          )}

          {/* Logout button */}
          <div className="px-4 py-2">
            <LogoutButton />
          </div>

          {/* Footer section */}
          <SidebarFooter />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export { SidebarProvider, AppSidebar, useSidebar, SidebarTrigger, Sidebar, navigationGroups } 