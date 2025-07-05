import React from 'react';
import { HERO_CONTENT } from '../constants';

interface HeaderSectionProps {
  isVisible: boolean;
}

/**
 * HeaderSection Component
 * Displays the main hero section with title and subtitle
 * 
 * @param isVisible - Whether the section should be visible for animations
 * @returns {JSX.Element} Hero section component
 */
export function HeaderSection({ isVisible }: HeaderSectionProps) {
  return (
    <section className="bg-gradient-to-b from-primary via-secondary to-secondary-light py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6 md:space-y-8">
        <h1 
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tighter !text-white leading-tight [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)] transition-all duration-1000 delay-200 px-2 sm:px-4 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {HERO_CONTENT.title}
        </h1>
        <p 
          className={`text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4 sm:px-6 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {HERO_CONTENT.subtitle}
        </p>
      </div>
    </section>
  );
} 