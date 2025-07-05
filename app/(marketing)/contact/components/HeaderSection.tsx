import React from 'react';
import { motion } from 'framer-motion';

interface HeaderSectionProps {
  variants: any;
}

/**
 * HeaderSection Component
 * Displays the main header section with title and description
 * 
 * @param variants - Framer Motion variants for animations
 * @returns {JSX.Element} Header section component
 */
export function HeaderSection({ variants }: HeaderSectionProps) {
  return (
    <motion.div className="mb-8 sm:mb-16 text-center" variants={variants}>
      <h1 className="mb-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
          Contact Us
        </span>
      </h1>
      <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground">
        We're here to help and answer any questions you might have. We look forward to hearing from you.
      </p>
    </motion.div>
  );
} 