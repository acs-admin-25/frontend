/**
 * File: app/about/page.tsx
 * Purpose: About page with responsive design and MUI-style animations
 * - Fully responsive layout optimized for all screen sizes
 * - Mobile-first design approach with enhanced touch interactions
 * - Properly centered content on all screen sizes
 * - Enhanced animations and interactions
 * - Uses theme colors for dynamic theming
 * Author: acagliol
 * Date: 06/15/25
 * Version: 1.6.0
 */

/**
 * Page Component
 * 
 * Features:
 * - Full-screen responsive layout with mobile optimization
 * - Centered content alignment on all screen sizes
 * - Mobile-first responsive design with enhanced touch targets
 * - Optimized for large screens with proper content scaling
 * - MUI-style animations and shadows
 * - Enhanced interactivity with touch-friendly elements
 * - Dynamic theming using theme CSS variables
 * 
 * Sections:
 * - Hero section with gradient background
 * - Introduction section
 * - Features showcase
 * - Platform features
 * - Leadership team
 * - Call-to-action
 * 
 * @returns {JSX.Element} Rendered component with responsive design and animations
 */

"use client"

import React, { useState, useEffect } from "react";
import {
  HeaderSection,
  AboutUsSection,
  WhatWeDoSection,
  WhyWereDifferentSection,
  OurTeamSection,
  LetsWorkTogetherSection,
} from "./components";
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import {
  LEADERSHIP_TEAM,
  FEATURES,
  PLATFORM_FEATURES,
  HERO_CONTENT,
  INTRODUCTION_CONTENT,
  WHAT_WE_DO_CONTENT,
  WHY_WERE_DIFFERENT_CONTENT,
  TEAM_CONTENT,
  CTA_CONTENT,
} from "./constants"

interface AvatarProps {
  src?: string;
  fallback: string;
  alt: string;
}

function Avatar({ src, fallback, alt }: AvatarProps) {
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-base sm:text-lg md:text-xl font-medium">
          {fallback}
        </div>
      )}
    </div>
  )
}

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [themeLoaded, setThemeLoaded] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Ensure theme variables are loaded
    const checkThemeLoaded = () => {
      const root = document.documentElement
      const backgroundAccent = getComputedStyle(root).getPropertyValue('--background-accent')
      if (backgroundAccent && backgroundAccent.trim() !== '') {
        setThemeLoaded(true)
      } else {
        // Retry after a short delay
        setTimeout(checkThemeLoaded, 100)
      }
    }
    
    checkThemeLoaded()
  }, [])

  return (
    <>
      <HeaderSection isVisible={isVisible} />
      <AboutUsSection isVisible={isVisible} />
      <WhatWeDoSection isVisible={isVisible} />
      <WhyWereDifferentSection isVisible={isVisible} />
      <OurTeamSection isVisible={isVisible} />
      <LetsWorkTogetherSection isVisible={isVisible} />
    </>
  )
}
