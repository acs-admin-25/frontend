import React from 'react';
import { motion } from 'framer-motion';

interface FAQSectionProps {
  variants: any;
  faqs: Array<{
    q: string;
    a: React.ReactNode;
  }>;
}

export function FAQSection({ variants, faqs }: FAQSectionProps) {
  return (
    <motion.div 
      className="mt-6 sm:mt-8 overflow-hidden rounded-xl bg-card p-4 sm:p-8 shadow-lg" 
      variants={variants}
    >
      <div className="mb-6">
        <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold text-card-foreground">
          Common Topics
        </h2>
        <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-secondary to-primary"></div>
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-lg border border-border p-4 sm:p-6 transition-all hover:border-secondary/20 hover:shadow-sm"
          >
            <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-medium text-card-foreground">
              {faq.q}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
