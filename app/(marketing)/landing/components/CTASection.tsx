import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface CTASectionProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

/**
 * CTASection Component
 * 
 * Call-to-action section with compelling messaging and action button.
 * 
 * Features:
 * - Responsive design
 * - Hover animations
 * - Accessibility support
 * - Customizable content
 * 
 * @param title - CTA title
 * @param description - CTA description
 * @param ctaText - Button text
 * @param ctaLink - Button link
 * @param className - Additional CSS classes
 */
export function CTASection({ 
  title = "Ready to Transform Your Real Estate Business?",
  description = "Join the future of real estate with our AI-powered platform",
  ctaText = "Get Started",
  ctaLink = "/demo",
  className 
}: CTASectionProps) {
  return (
    <section className={cn(
      "py-12 sm:py-16 md:py-20 bg-[var(--primary-dark)] relative overflow-hidden",
      className
    )}>
      <div className="absolute inset-0">
        {/* Background pattern can be added here */}
      </div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter !text-white mb-6 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed mb-8"
          >
            {description}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={ctaLink}
              className="group inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 bg-white !text-secondary-dark hover:bg-gray-100 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base shadow-lg shadow-black/20 hover:shadow-xl transform hover:-translate-y-1 min-h-[44px] sm:min-h-[48px]"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 