/**
 * Testimonials data constants for the contact page
 */

export interface Testimonial {
  quote: string;
  author: string;
  position: string;
  company: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "ACS transformed our operations with their innovative solutions. Their team was responsive, professional, and delivered beyond our expectations.",
    author: "Sarah Johnson",
    position: "CTO",
    company: "TechVision Inc.",
  },
  {
    quote:
      "Working with ACS has been a game-changer for our business. Their expertise and dedication to our success made all the difference.",
    author: "Michael Chen",
    position: "Operations Director",
    company: "Global Systems",
  },
  {
    quote:
      "The team at ACS provided exceptional service from start to finish. Their attention to detail and commitment to quality is unmatched.",
    author: "Emily Rodriguez",
    position: "CEO",
    company: "Innovate Partners",
  },
]; 