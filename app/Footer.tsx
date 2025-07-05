'use client';

/**
 * File: app/Footer.tsx
 * Purpose: Renders the application footer with navigation links, company information, and legal resources.
 * Author: acagliol
 * Date: 06/15/25
 * Version: 1.0.6
 */

import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { cn } from "@/lib/utils/utils"

/**
 * Footer Component
 * Application footer with responsive grid layout and navigation sections
 * 
 * Features:
 * - Responsive grid layout
 * - Company branding
 * - Navigation sections (Solutions, Company, Legal)
 * - Dynamic copyright year
 * - Hover effects on links
 * - Semantic HTML structure
 * 
 * Sections:
 * - Brand section with company description
 * - Solutions links for product features
 * - Company information and resources
 * - Legal documents and policies
 * 
 * @returns {JSX.Element} Complete footer with all navigation sections and copyright
 */
export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 font-sans">
      <div className="container mx-auto px-4">
        {/* Main footer content in responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section with logo and description */}
          <div>
            <Logo href="/" size="md" variant="icon-only" />
            <p className="mt-2 text-muted-foreground font-semibold">AI-powered solutions for real estate professionals</p>
          </div>

          {/* Solutions navigation section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Solutions</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  Lead Conversion Pipeline (LCP)
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  Lead Generation Workflow (LGW)
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  AI-Powered Automation
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  Real Estate Specialization
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal documents section */}
          <div>
            <Link href="/legal" className="font-semibold text-foreground mb-3 hover:text-primary transition-colors duration-200 block">
              Legal
            </Link>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Company information section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-semibold text-primary hover:text-primary-light transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright section with dynamic year */}
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm font-semibold">
          <p>&copy; {new Date().getFullYear()} ACS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

/**
 * Change Log:
 * 06/15/25 - Version 1.0.6
 * - Updated all Solutions section links to point to /about instead of /solutions
 * 
 * 06/15/25 - Version 1.0.5
 * - Updated Solutions section with current offerings:
 *   - Lead Conversion Pipeline (LCP)
 *   - Lead Generation Workflow (LGW)
 *   - AI-Powered Automation
 *   - Real Estate Specialization
 * 
 * 06/15/25 - Version 1.0.4
 * - Removed: -- a/app/Footer.tsx
 * - Added: ++ b/app/Footer.tsx
 * - Removed:                 <Link href="/pricing" style={{ color: '#0e6537', textDecoration: 'none' }} className="font-semibold hover:text-[#157a42]">
 * - Added:                 <Link href="/solutions" style={{ color: '#0e6537', textDecoration: 'none' }} className="font-semibold hover:text-[#157a42]">
 * - Removed:                 <Link href="/email" style={{ color: '#0e6537', textDecoration: 'none' }} className="font-semibold hover:text-[#157a42]">
 * 
 * 06/11/25 - Version 1.0.1
 * - Updated documentation format
 * - Enhanced component documentation
 * - Added detailed feature descriptions
 * 
 * 5/25/25 - Version 1.0.0
 * - Created responsive footer layout
 * - Added navigation sections
 * - Implemented company branding
 * - Added legal resources
 * - Integrated dynamic copyright year
 * - Enhanced link hover effects
 * - Improved semantic structure
*/