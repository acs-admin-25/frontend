import React from 'react';
import { WHY_WERE_DIFFERENT_CONTENT, PLATFORM_FEATURES } from '../constants';

interface WhyWereDifferentSectionProps {
  isVisible: boolean;
}

export function WhyWereDifferentSection({ isVisible }: WhyWereDifferentSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2
            className={`text-muted text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mb-3 sm:mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {WHY_WERE_DIFFERENT_CONTENT.title}
          </h2>
          <p
            className={`text-muted max-w-3xl mx-auto text-sm sm:text-base md:text-lg transition-all duration-700 delay-200 px-4 sm:px-6 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {WHY_WERE_DIFFERENT_CONTENT.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {PLATFORM_FEATURES.map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-muted to-background rounded-2xl p-4 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-border ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-secondary mb-3 sm:mb-4 bg-card p-2 sm:p-3 rounded-xl shadow-sm inline-block">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mb-3 sm:mb-4">{feature.description}</p>
              <div className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full inline-block">
                {feature.metric}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-muted mt-6 sm:mt-8 md:mt-12 text-xs sm:text-sm md:text-base px-4 sm:px-6">
          {WHY_WERE_DIFFERENT_CONTENT.footer}
        </p>
      </div>
    </section>
  );
} 