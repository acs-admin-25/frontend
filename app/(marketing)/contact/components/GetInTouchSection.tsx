import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Clock } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

interface GetInTouchSectionProps {
  variants: any;
}

/**
 * GetInTouchSection Component
 * Displays contact information including address, email, and business hours
 * 
 * @param variants - Framer Motion variants for animations
 * @returns {JSX.Element} Get in touch section component
 */
export function GetInTouchSection({ variants }: GetInTouchSectionProps) {
  return (
    <motion.div className="md:col-span-5 lg:col-span-4" variants={variants}>
      <div className="rounded-xl bg-card p-4 sm:p-8 shadow-lg">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold text-card-foreground">
            Get in Touch
          </h2>
          <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-secondary to-primary"></div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-full bg-accent p-2 sm:p-3 text-secondary">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium text-card-foreground">Our Location</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {CONTACT_INFO.address.street}
                <br />
                {CONTACT_INFO.address.city}, {CONTACT_INFO.address.state} {CONTACT_INFO.address.zip}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-full bg-accent p-2 sm:p-3 text-secondary">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium text-card-foreground">Email</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {CONTACT_INFO.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-full bg-accent p-2 sm:p-3 text-secondary">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium text-card-foreground">Business Hours</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {CONTACT_INFO.businessHours.weekdays}
                <br />
                {CONTACT_INFO.businessHours.saturday}
              </p>
            </div>
          </div>
        </div>

        {/* LinkedIn Button with improved styling */}
        <div className="mt-8 pt-6 border-t border-border">
          <a
            href={CONTACT_INFO.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="!text-white inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#0077b5] to-[#005885] px-6 py-3 rounded-lg hover:from-[#005885] hover:to-[#004065] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Follow us on LinkedIn
          </a>
        </div>
      </div>
    </motion.div>
  );
} 