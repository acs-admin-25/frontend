import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { HeroData } from '@/types/landing';
import { ThreeJSViewer } from './ThreeJSViewer';
import { shuffleArray } from '@/lib/utils/landing';

interface HeroSectionProps {
  data: HeroData;
  className?: string;
}

/**
 * HeroSection Component
 * 
 * The main hero section of the landing page featuring:
 * - Animated title with gradient text
 * - Rotating statements
 * - Call-to-action button
 * - Centralized layout with thematic gradient background
 * 
 * Features:
 * - Responsive design
 * - Smooth animations
 * - Accessibility support
 * - TypeScript safety
 * 
 * @param data - Hero section data including title, description, and statements
 * @param className - Additional CSS classes
 */
export function HeroSection({ data, className }: HeroSectionProps) {
  const [shuffledStatements, setShuffledStatements] = useState<string[]>([]);
  const [currentStatement, setCurrentStatement] = useState(0);
  const [fade, setFade] = useState(true);

  // Initialize shuffled statements on mount
  useEffect(() => {
    setShuffledStatements(shuffleArray(data.rotatingStatements));
  }, [data.rotatingStatements]);

  // Rotate statements every 5 seconds
  useEffect(() => {
    if (shuffledStatements.length === 0) return;
    
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentStatement((prev) => (prev + 1) % shuffledStatements.length);
        setFade(true);
      }, 400); // fade out before changing
    }, 5000);
    
    return () => clearInterval(interval);
  }, [shuffledStatements]);

  return (
    <section className={cn(
      "relative flex items-center justify-center overflow-hidden py-8 h-screen",
      className
    )}>
      {/* Thematic Gradient Background with Randomness */}
      <div 
        className="absolute inset-0 h-full w-full"
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 20% 30%, var(--midnight-950) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, var(--midnight-950) 0%, transparent 60%),
            radial-gradient(circle at 40% 80%, var(--midnight-900) 0%, transparent 50%),
            radial-gradient(circle at 90% 20%, var(--midnight-900) 0%, transparent 40%),
            radial-gradient(circle at 10% 90%, var(--midnight-950) 0%, transparent 40%),
            linear-gradient(135deg, var(--midnight-950) 0%, var(--midnight-900) 40%, var(--midnight-900) 80%, var(--midnight-950) 100%)
          `,
          backgroundSize: "400% 400%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      
      {/* Animated floating gradient orbs with randomness */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float-1"
        style={{
          background: `radial-gradient(circle, var(--midnight-700)/40, var(--midnight-600)/20, var(--midnight-500)/10)`,
          animationDelay: '0s',
          animationDuration: '8s'
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-float-2"
        style={{
          background: `radial-gradient(circle, var(--midnight-800)/35, var(--midnight-700)/25, var(--midnight-600)/15)`,
          animationDelay: '2s',
          animationDuration: '10s'
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-2xl animate-float-3"
        style={{
          background: `radial-gradient(circle, var(--midnight-600)/30, var(--midnight-500)/20, var(--midnight-700)/10)`,
          animationDelay: '4s',
          animationDuration: '12s'
        }}
      />
      
      {/* Additional random gradient elements */}
      <div 
        className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full blur-xl animate-float-1"
        style={{
          background: `radial-gradient(circle, var(--midnight-500)/25, var(--midnight-600)/15, transparent)`,
          animationDelay: '1s',
          animationDuration: '9s'
        }}
      />
      <div 
        className="absolute bottom-1/3 left-1/3 w-56 h-56 rounded-full blur-2xl animate-float-2"
        style={{
          background: `radial-gradient(circle, var(--midnight-950)/20, var(--midnight-800)/10, transparent)`,
          animationDelay: '3s',
          animationDuration: '11s'
        }}
      />
      
      {/* Subtle mesh gradient overlay for depth */}
      <div 
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          background: `
            radial-gradient(circle at 30% 60%, var(--midnight-700) 0%, transparent 40%),
            radial-gradient(circle at 70% 40%, var(--midnight-800) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, var(--midnight-600) 0%, transparent 30%)
          `
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 h-full">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8 sm:space-y-10">
          {/* Main Title */}
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tighter leading-tight">
              <span className="block text-white mb-2">
                {data.mainTitle.line1}
              </span>
              <motion.span
                className="block"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--primary-foreground), var(--midnight-700), var(--midnight-600), var(--midnight-500), var(--midnight-600), var(--midnight-700), var(--primary-foreground))',
                  backgroundSize: '400% 100%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{
                  backgroundPosition: ['-150% 50%', '250% 50%', '-150% 50%']
                }}
                transition={{
                  duration: 24,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                aria-label={data.mainTitle.line2}
              >
                {data.mainTitle.line2}
              </motion.span>
            </h1>
          </div>

          {/* ThreeJS Viewer between title and description */}
          <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 rounded-2xl bg-transparent overflow-hidden">
            <ThreeJSViewer 
              splineUrl={data.splineUrl}
              className="w-full h-full"
              cacheBust={true}
              forceRefresh={true}
            />
          </div>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-3xl leading-relaxed">
            {data.description}
          </p>

          {/* Rotating Statements */}
          <div className="min-h-[32px] md:min-h-[36px] lg:min-h-[40px] flex items-center justify-center">
            {shuffledStatements.length > 0 && (
              <motion.div
                key={shuffledStatements[currentStatement]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: fade ? 1 : 0, y: fade ? 0 : -10 }}
                transition={{ duration: 0.4 }}
                className="text-white/80 text-base md:text-lg lg:text-xl font-medium"
                aria-live="polite"
              >
                {shuffledStatements[currentStatement]}
              </motion.div>
            )}
          </div>

          {/* Call-to-Action Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={data.ctaLink}
              className="group inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base shadow-lg shadow-black/20 hover:shadow-xl transform hover:-translate-y-1 min-h-[44px] sm:min-h-[48px]"
            >
              {data.ctaText}
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Commented out ThreeJS Component */}
        
        
        
      </div>
    </section>
  );
}