import React from 'react';
import { INTRODUCTION_CONTENT } from '../constants';

interface AboutUsSectionProps {
  isVisible: boolean;
}

export function AboutUsSection({ isVisible }: AboutUsSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`bg-gradient-to-r from-muted to-background p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl hover:shadow-2xl border border-secondary/20 hover:border-secondary/40 transition-all duration-500 transform hover:-translate-y-1 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed text-center">
            {INTRODUCTION_CONTENT.text}
          </p>
        </div>
      </div>
    </section>
  );
} 