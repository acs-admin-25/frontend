import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/utils';
import { Benefit } from '@/types/landing';

interface BenefitsSectionProps {
  benefits: Benefit[];
  title?: string;
  description?: string;
  className?: string;
}

/**
 * BenefitsSection Component
 * 
 * Displays a grid of platform benefits with icons and descriptions.
 * 
 * Features:
 * - Responsive grid layout
 * - Scroll-triggered animations
 * - Hover effects
 * - Accessibility support
 * 
 * @param benefits - Array of benefit objects
 * @param title - Section title
 * @param description - Section description
 * @param className - Additional CSS classes
 */
export function BenefitsSection({ 
  benefits, 
  title = "Platform Features",
  description = "Experience the power of our comprehensive AI platform",
  className 
}: BenefitsSectionProps) {
  return (
    <section className={cn(
      "py-12 sm:py-16 md:py-20 bg-gray-50 mb-8 sm:mb-12 md:mb-16 lg:mb-20",
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-3 bg-green-50 rounded-xl w-fit mb-6">
                {React.createElement(benefit.icon, { 
                  className: "h-6 w-6 text-secondary-dark" 
                })}
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 