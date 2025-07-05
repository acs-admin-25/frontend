"use client"

import { Shield, Lock, Cookie, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PageLayout } from "@/components/common/Layout/PageLayout"
import { useEffect } from "react"
import { applyTheme, getCurrentTheme } from "@/lib/theme/simple-theme"

export default function LegalPage() {
  useEffect(() => {
    applyTheme(getCurrentTheme());
  }, []);

  return (
    <>
      {/* Top Row: Back Button & Logo */}
      <div className="max-w-7xl mx-auto flex items-center justify-between p-8 pt-8 pb-0">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-[#0e6537] hover:text-[#0a5a2f] transition-colors text-base sm:text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        <Link href="/">
          <img src="/favicon.ico" alt="ACS Logo" className="w-16 h-16 object-contain cursor-pointer" />
        </Link>
      </div>
      <div className="max-w-7xl mx-auto p-8 pt-4 min-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0e6537] rounded-lg shadow-2xl border border-[#0e6537]/20 p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Legal Information</h1>
          <p className="text-white/80">Please review our legal documents.</p>
        </div>
        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 mt-6">
          {/* Terms of Service Card */}
          <div>
            <Link href="/legal/terms" className="block group">
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 transition-shadow group-hover:shadow-[0_8px_24px_0_rgba(14,101,55,0.35)] cursor-pointer">
                <div className="flex items-center gap-3 text-[#0e6537] mb-4">
                  <Shield className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Terms of Service</h2>
                </div>
                <p className="text-gray-600">
                  Read our terms of service to understand the rules and guidelines for using our platform.
                </p>
              </div>
            </Link>
          </div>
          {/* Privacy Policy Card */}
          <div>
            <Link href="/legal/privacy" className="block group">
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 transition-shadow group-hover:shadow-[0_8px_24px_0_rgba(14,101,55,0.35)] cursor-pointer">
                <div className="flex items-center gap-3 text-[#0e6537] mb-4">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Privacy Policy</h2>
                </div>
                <p className="text-gray-600">
                  Learn about how we collect, use, and protect your personal information.
                </p>
              </div>
            </Link>
          </div>
          {/* Cookie Policy Card */}
          <div>
            <Link href="/legal/cookies" className="block group">
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 transition-shadow group-hover:shadow-[0_8px_24px_0_rgba(14,101,55,0.35)] cursor-pointer">
                <div className="flex items-center gap-3 text-[#0e6537] mb-4">
                  <Cookie className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Cookie Policy</h2>
                </div>
                <p className="text-gray-600">
                  Understand how we use cookies and similar technologies on our website.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* Last Updated - pushed further down with extra margin */}
      <div className="mb-2 mt-10 text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </div>
      {/* ACS Tag - always below Last Updated and visible */}
      <div className="mb-4 text-center text-xs text-gray-400">
        © 2025 ACS. All rights reserved.
      </div>
    </>
  )
}


/**
 <----------------- Change Log ----------------->
  Legal Label in Dashboard
      Reason: there was no way to get to the legal page.tsx file beside the back buttons from the other legal pages
        Fixes
          Changed the Legal label (found in Footer.tsx) to be a link to legal’s page.tsx page

  Main Legal Page Reorganized
      Reason: 3 sections (term, privacy, cookies )were squished together → unreadable
        Fixes
          Container width increased
          Increased padding
          Gap between sections increased
      Reason: Moved last updated label → was too close to the other stuff, thought it should be lower
        Fixes
          Lowered on the screen
      Reason: Links for each section (term, privacy, cookies) were clickable from outside their box 
        Fixes
          Changed to only be clickable within their sections
      Reason: Too bland, everything was too white
        Fixes
          Changed top bar to inverted colors, added shadow to make it stand out, lowered sections container to avoid overlapping
      Reason: Minor changes on mobile version, copyright ACS tag at bottom was not visible
        Fixes
          Tag was placed below last updated tag
      Reason: ACS Logo was not visible
        Fixes
          Logo was added

  Terms of Service Page Reorganized
      Reason: Page looked like it was only made for mobile
        Fixes
          Increased width of top bar and container
      Reason: Top bar inconsistent with legal page
        Fixes
          Changed design to match the legal page

  Privacy Page Reorganized
      Reason: inconsistent with the other pages
        Fixes
          Changed design to match the other pages

  Cookies Page Reorganized
      Reason: inconsistent with the other pages
        Fixes
          Changed design to match the other pages
**/