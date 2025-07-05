import { Users, Target, Zap, Laptop, TrendingUp, Lock } from 'lucide-react';
import { Feature, Benefit, Testimonial, LandingPageData } from '@/types/landing';
import { HERO_CONSTANTS } from './hero';

export const LANDING_PAGE_DATA: LandingPageData = {
  hero: HERO_CONSTANTS,
  
  features: [
    {
      title: "Lead Conversion Pipeline (LCP)",
      description: "Streamline your lead management with our AI-powered pipeline that automatically qualifies and nurtures leads.",
      icon: Users,
      demoImage: "/lcptrans.png"
    },
    {
      title: "Lead Generation Workflow (LGW)",
      description: "Automate your lead generation process with intelligent workflows that identify and engage potential clients.",
      icon: Target,
      demoImage: "/lgw.png"
    },
    {
      title: "AI-Powered Automation",
      description: "Leverage advanced AI algorithms to automate repetitive tasks and focus on what matters most.",
      icon: Zap,
      demoImage: "/aitrans.png"
    },
    {
      title: "Real Estate Specialization",
      description: "Built specifically for real estate professionals with industry-specific features and insights.",
      icon: Laptop,
      demoImage: "/realtrans.png"
    }
  ],

  benefits: [
    {
      title: "AI-Powered Automation",
      description: "Automate complex business processes and identify inefficiencies using advanced artificial intelligence.",
      icon: Zap
    },
    {
      title: "Cost Optimization",
      description: "Reduce operational expenses and enable strategic growth for small businesses.",
      icon: TrendingUp
    },
    {
      title: "Personalized Service",
      description: "Hands-on, long-term support tailored to each client's unique needs.",
      icon: Users
    },
    {
      title: "AWS Cloud Infrastructure",
      description: "Built on AWS with DynamoDB, API Gateway, Lambda, and Cognito for secure, scalable solutions.",
      icon: Lock
    }
  ],

  testimonials: [
    {
      quote: "ACS has completely transformed how I approach property valuations. The AI predictions are incredibly accurate.",
      author: "Sarah Johnson",
      role: "Real Estate Agent",
    },
    {
      quote: "The virtual staging feature has helped me sell properties 30% faster than before. Clients love seeing the potential.",
      author: "Michael Chen",
      role: "Property Developer",
    },
    {
      quote: "The lead scoring system has saved me countless hours by focusing my attention on the most promising clients.",
      author: "Jessica Williams",
      role: "Broker",
    },
  ]
}; 