import { useMemo } from 'react';
import { LANDING_PAGE_DATA } from '@/app/(marketing)/landing/constants/landing-data';
import type { LandingPageData } from '@/types/landing';

/**
 * useLandingData Hook
 * 
 * Provides centralized access to landing page data and content.
 * 
 * Features:
 * - Memoized data access
 * - Type-safe data structure
 * - Centralized data management
 * - Easy data updates
 * 
 * @returns Landing page data object
 */
export function useLandingData(): LandingPageData {
  const data = useMemo(() => LANDING_PAGE_DATA, []);
  
  return data;
}

/**
 * useHeroData Hook
 * 
 * Provides access to hero section data specifically.
 * 
 * @returns Hero section data
 */
export function useHeroData() {
  const { hero } = useLandingData();
  return hero;
}

/**
 * useFeaturesData Hook
 * 
 * Provides access to features section data specifically.
 * 
 * @returns Features array
 */
export function useFeaturesData() {
  const { features } = useLandingData();
  return features;
}

/**
 * useBenefitsData Hook
 * 
 * Provides access to benefits section data specifically.
 * 
 * @returns Benefits array
 */
export function useBenefitsData() {
  const { benefits } = useLandingData();
  return benefits;
}

/**
 * useTestimonialsData Hook
 * 
 * Provides access to testimonials data specifically.
 * 
 * @returns Testimonials array
 */
export function useTestimonialsData() {
  const { testimonials } = useLandingData();
  return testimonials;
} 