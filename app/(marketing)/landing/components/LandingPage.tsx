import React from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { FeaturesSection } from './FeaturesSection';
import { HeroSection } from './HeroSection';
import { BenefitsSection } from './BenefitsSection';
import { CTASection } from './CTASection';
import { useLandingData } from '../hooks/useLandingData';

interface LandingPageProps {
  className?: string;
}

/**
 * LandingPage Component
 * 
 * Main landing page component that orchestrates all sections.
 * 
 * Features:
 * - Modular section components
 * - Error boundaries
 * - Loading states
 * - Responsive design
 * - Accessibility support
 * 
 * @param className - Additional CSS classes
 */
export function LandingPage({ className }: LandingPageProps) {
  const { hero, features, benefits } = useLandingData();

  return (
    <ErrorBoundary fallback={<div>Something went wrong loading the landing page.</div>}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background relative overflow-hidden font-sans"
      >
        {/* Hero Section */}
        <HeroSection data={hero} />

        {/* Features Section */}
        <FeaturesSection features={features} />

        {/* Benefits Section */}
        <BenefitsSection benefits={benefits} />

        {/* CTA Section */}
        <CTASection />
      </motion.div>
    </ErrorBoundary>
  );
} 