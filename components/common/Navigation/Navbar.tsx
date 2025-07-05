/**
 * File: components/common/Navigation/Navbar.tsx
 * Purpose: Refactored navigation bar with smaller, focused components
 * Author: Alejo Cagliolo
 * Date: 5/25/25
 * Version: 2.0.0
 */

"use client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { Logo } from "@/components/ui/Logo"
interface NavbarProps {
  className?: string;
}

interface NavigationItemProps {
  item: string;
  href: string;
  isHovered: boolean;
  onHover: (item: string | null) => void;
  onClick?: () => void;
  isMobile?: boolean;
}

interface AuthButtonProps {
  href: string;
  variant: 'signin' | 'getstarted';
  isHovered: boolean;
  onHover: (item: string | null) => void;
  onClick?: () => void;
  isMobile?: boolean;
}

/**
 * Navigation Item Component
 * Individual navigation link with hover effects
 */
function NavigationItem({ item, href, isHovered, onHover, onClick, isMobile }: NavigationItemProps) {
  if (isMobile) {
    return (
      <Link
        href={href}
        className="block px-3 py-3 rounded-md text-base font-medium text-primary hover:bg-accent transition-colors duration-200"
        onClick={onClick}
      >
        {item}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="relative py-2 px-1"
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="relative z-10 transition-colors duration-300 text-base lg:text-lg xl:text-xl font-medium text-primary">
        {item}
      </span>
      {isHovered && (
        <motion.span
          className="absolute inset-0 bg-accent rounded-md z-0"
          layoutId="navBackground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      )}
    </Link>
  )
}

/**
 * Authentication Button Component
 * Sign in or Get Started button with hover effects
 */
function AuthButton({ href, variant, isHovered, onHover, onClick, isMobile }: AuthButtonProps) {
  if (isMobile) {
    const isSignIn = variant === 'signin';
    return (
      <Link
        href={href}
        className={cn(
          "block px-3 py-3 rounded-md text-base font-medium transition-colors duration-200",
          isSignIn 
            ? "text-primary hover:bg-accent" 
            : "text-white bg-primary hover:bg-primary-dark"
        )}
        onClick={onClick}
      >
        {isSignIn ? 'Sign in' : 'Get Started'}
      </Link>
    )
  }

  if (variant === 'signin') {
    return (
      <Link
        href={href}
        className="relative overflow-hidden group py-2 px-3 lg:px-4"
        onMouseEnter={() => onHover("signin")}
        onMouseLeave={() => onHover(null)}
      >
        <span className="relative z-10 font-medium transition-colors duration-300 text-base lg:text-lg text-primary">
          Sign in
        </span>
        {isHovered && (
          <motion.span
            className="absolute inset-0 bg-accent rounded-md z-0"
            layoutId="navBackground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
        )}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="relative group"
      onMouseEnter={() => onHover("getstarted")}
      onMouseLeave={() => onHover(null)}
    >
      <span className="relative z-10 inline-flex items-center gap-2 px-4 lg:px-6 xl:px-8 py-2 lg:py-3 font-medium text-white rounded-full overflow-hidden whitespace-nowrap text-base lg:text-lg">
        Get Started
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:translate-x-1 lg:w-5 lg:h-5"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </span>
      <span className="absolute inset-0 rounded-full bg-primary transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_rgba(14,101,55,0.4)]"></span>
    </Link>
  )
}

/**
 * Mobile Menu Component
 * Responsive mobile navigation menu
 */
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigationItems = ["Home", "About", "Contact"]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden"
        >
          <div className="pt-4 pb-3 space-y-1">
            {navigationItems.map((item, index) => {
              const href = item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`
              return (
                <NavigationItem
                  key={index}
                  item={item}
                  href={href}
                  isHovered={false}
                  onHover={() => {}}
                  onClick={onClose}
                  isMobile={true}
                />
              )
            })}
            <div className="pt-4 border-t border-border">
              <AuthButton
                href="/demo"
                variant="signin"
                isHovered={false}
                onHover={() => {}}
                onClick={onClose}
                isMobile={true}
              />
              <AuthButton
                href="/demo"
                variant="getstarted"
                isHovered={false}
                onHover={() => {}}
                onClick={onClose}
                isMobile={true}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Navbar Component
 * Main navigation component with responsive design and interactive elements
 * 
 * Features:
 * - Responsive navigation menu
 * - Animated hover effects using Framer Motion
 * - Authentication links (Sign in/Get Started)
 * - Mobile-friendly design with hamburger menu
 * - Sticky positioning
 * - Gradient text and button effects
 * 
 * State Management:
 * - Tracks hovered navigation items
 * - Manages responsive menu state
 * - Controls mobile menu visibility
 * 
 * @returns {JSX.Element} Complete navigation bar with all interactive elements
 */
export function Navbar({ className = "" }: NavbarProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDashboard, setIsDashboard] = useState(false)

  const navigationItems = ["Home", "About", "Contact"]

  useEffect(() => {
    setIsDashboard(window.location.pathname.startsWith('/dashboard'))
  }, [])

  return (
    <nav className={cn(
      "bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-50 font-sans",
      className
    )}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 lg:py-5">
          {/* Logo/Brand link */}
          <div className="flex-shrink-0">
            <Logo href="/" size="lg" variant="icon-only" />
          </div>

          {/* Mobile menu button - only show if not on dashboard */}
          {!isDashboard && (
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              ) : (
                <Menu className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              )}
            </button>
          )}

          {/* Desktop navigation - Centered - only show if not on dashboard */}
          {!isDashboard && (
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center space-x-8 lg:space-x-12 xl:space-x-16">
                {navigationItems.map((item, index) => {
                  const href = item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`
                  return (
                    <NavigationItem
                      key={index}
                      item={item}
                      href={href}
                      isHovered={hovered === item}
                      onHover={setHovered}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Desktop authentication links - only show if not on dashboard */}
          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8 w-auto lg:w-[300px] xl:w-[350px] justify-end">
              <AuthButton
                href="/demo"
                variant="signin"
                isHovered={hovered === "signin"}
                onHover={setHovered}
              />
              <AuthButton
                href="/demo"
                variant="getstarted"
                isHovered={hovered === "getstarted"}
                onHover={setHovered}
              />
            </div>
          )}
        </div>

        {/* Mobile menu - only show if not on dashboard */}
        {!isDashboard && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  )
}

export default Navbar 