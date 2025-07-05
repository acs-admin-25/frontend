import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface CTASectionProps {
  isSubmitted: boolean;
  onReset: () => void;
}

/**
 * CTASection Component
 * Displays the call-to-action section with success state and form reset functionality
 * 
 * @param isSubmitted - Whether the form has been successfully submitted
 * @param onReset - Function to reset the form state
 * @returns {JSX.Element} CTA section component
 */
export function CTASection({ isSubmitted, onReset }: CTASectionProps) {
  if (!isSubmitted) return null;

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-8 sm:py-16 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 sm:mb-6 rounded-full bg-accent p-3 sm:p-4">
        <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-secondary" />
      </div>
      <h2 className="mb-2 text-xl sm:text-2xl font-bold text-card-foreground">
        Message Sent Successfully!
      </h2>
      <p className="mb-6 sm:mb-8 max-w-md text-sm sm:text-base text-muted-foreground">
        Thank you for reaching out to us. We've received your message and will get back to you as soon as
        possible.
      </p>
      <Button
        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        onClick={onReset}
      >
        Send Another Message
      </Button>
    </motion.div>
  );
} 