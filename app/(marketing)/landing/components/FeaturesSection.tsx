import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils/utils';
import { Feature } from '@/types/landing';

interface FeaturesSectionProps {
  features: Feature[];
  title?: string;
  description?: string;
  className?: string;
}

/**
 * FeaturesSection Component
 * 
 * Displays a grid of features with icons, descriptions, and demo images.
 * 
 * Features:
 * - Responsive grid layout
 * - Scroll-triggered animations
 * - Optimized image loading
 * - Accessibility support
 * 
 * @param features - Array of feature objects
 * @param title - Section title
 * @param description - Section description
 * @param className - Additional CSS classes
 */
export function FeaturesSection({ 
  features, 
  title = "Our Solutions",
  description = "Discover how our AI-powered platform transforms real estate operations",
  className 
}: FeaturesSectionProps) {
  return (
    <section className={cn(
      "py-16 sm:py-20 md:py-28 bg-gradient-to-br from-[var(--midnight-800)] via-[var(--midnight-700)] to-[var(--midnight-600)] mb-8 sm:mb-12 md:mb-16 lg:mb-20",
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  {feature.icon && (
                    <div className="p-3 bg-[var(--midnight-50)] rounded-xl">
                      {React.createElement(feature.icon, { 
                        className: "h-6 w-6 text-[var(--midnight-700)]" 
                      })}
                    </div>
                  )}
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              {feature.demoImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--midnight-700)]/20 bg-white">
                  <Image
                    src={feature.demoImage}
                    alt={feature.title}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 