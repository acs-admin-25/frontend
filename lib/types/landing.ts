export interface Feature {
  title: string;
  description: string;
  imageUrl?: string;
  icon?: React.ElementType;
  demoImage?: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface HeroData {
  mainTitle: {
    line1: string;
    line2: string;
  };
  description: string;
  ctaText: string;
  ctaLink: string;
  rotatingStatements: string[];
  splineUrl?: string;
}

export interface LandingPageData {
  hero: HeroData;
  features: Feature[];
  benefits: Benefit[];
  testimonials: Testimonial[];
} 