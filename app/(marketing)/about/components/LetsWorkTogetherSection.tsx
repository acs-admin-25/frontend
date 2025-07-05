import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CTA_CONTENT } from '../constants';

interface LetsWorkTogetherSectionProps {
  isVisible: boolean;
}

export function LetsWorkTogetherSection({ isVisible }: LetsWorkTogetherSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-secondary to-secondary-light relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter !text-white mb-4 sm:mb-6 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)] transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {CTA_CONTENT.title}
        </h2>
        <p
          className={`text-white/90 max-w-2xl mx-auto mb-4 sm:mb-6 text-sm sm:text-base md:text-lg transition-all duration-700 delay-200 px-4 sm:px-6 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {CTA_CONTENT.subtitle}
        </p>
        <p
          className={`text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base md:text-lg transition-all duration-700 delay-300 px-4 sm:px-6 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {CTA_CONTENT.description}
        </p>
        <div
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 bg-white !text-secondary hover:bg-gray-100 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base shadow-lg shadow-black/20 hover:shadow-xl transform hover:-translate-y-1 min-h-[44px] sm:min-h-[48px]"
          >
            {CTA_CONTENT.buttons.contact}
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <Link
            href="/signup"
            className="!text-white group inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 border-2 border-white hover:bg-white/10 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base backdrop-blur-sm hover:backdrop-blur-md transform hover:-translate-y-1 min-h-[44px] sm:min-h-[48px]"
          >
            {CTA_CONTENT.buttons.signup}
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
} 