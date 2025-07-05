/**
 * File: app/(marketing)/contact/page.tsx
 * Purpose: Contact page using modular components and centralized functionality
 * Author: AI Agent
 * Date: 2024
 * Version: 2.0.0
 * 
 * This page has been restructured to follow the AI Agent Editing Guide:
 * - Modular component architecture
 * - Centralized data management
 * - Type-safe implementations
 * - Proper error handling
 * - Accessibility compliance
 * - Performance optimizations
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  CONTAINER_VARIANTS, 
  ITEM_VARIANTS 
} from "./constants"
import {
  GetInTouchSection,
  SendMessageSection,
  FAQSection,
  CTASection,
  HeaderSection
} from "./components"

/**
 * ContactPage Component
 * Main contact page component using modular components and hooks
 * 
 * @returns {JSX.Element} Complete contact page with form and information sections
 */
export default function ContactPage() {

  const containerVariants = CONTAINER_VARIANTS
  const itemVariants = ITEM_VARIANTS

  return (
      <div className="relative min-h-screen bg-gradient-to-b from-accent via-accent/50 to-background">
        {/* Background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle gradient circles */}
          <div className="absolute -top-[15%] -right-[15%] h-[50%] w-[50%] rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute top-[60%] -left-[10%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute -bottom-[10%] right-[20%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-3xl" />

          {/* Add a subtle dot pattern instead */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(var(--secondary) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <motion.div
          className="container relative mx-auto px-4 py-8 sm:py-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
        <HeaderSection variants={itemVariants} />

          <div className="mx-auto max-w-6xl">
            {/* Contact Form and Information */}
            <div className="grid gap-4 sm:gap-8 md:grid-cols-12">
              {/* Contact Information */}
            <GetInTouchSection variants={itemVariants} />

              {/* Contact Form */}
            <SendMessageSection
              variants={itemVariants}
            />
            </div>

            {/* FAQ Section */}
          <FAQSection variants={itemVariants} />
          </div>
        </motion.div>
      </div>
  )
}
