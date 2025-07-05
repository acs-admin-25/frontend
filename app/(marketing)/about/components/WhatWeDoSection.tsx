import React from 'react';
import { WHAT_WE_DO_CONTENT, FEATURES } from '../constants';
import { ArrowRight } from 'lucide-react';

interface WhatWeDoSectionProps {
  isVisible: boolean;
}

export function WhatWeDoSection({ isVisible }: WhatWeDoSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-muted to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mb-3 sm:mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {WHAT_WE_DO_CONTENT.title}
          </h2>
          <p
            className={`text-muted-foreground max-w-3xl mx-auto text-sm sm:text-base md:text-lg transition-all duration-700 delay-200 px-4 sm:px-6 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {WHAT_WE_DO_CONTENT.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl border border-secondary/20 hover:border-secondary/40 transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 sm:mb-6 shadow-lg`}>
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4">{feature.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-secondary bg-secondary/10 px-2 sm:px-3 py-1 rounded-full">
                  {feature.stats}
                </span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-secondary transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-6 sm:mt-8 md:mt-12 text-xs sm:text-sm md:text-base px-4 sm:px-6">
          {WHAT_WE_DO_CONTENT.footer}
        </p>
      </div>
    </section>
  );
} 