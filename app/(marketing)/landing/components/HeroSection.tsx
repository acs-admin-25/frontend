import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { HeroData } from '@/lib/types/landing';
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
      "relative flex flex-col lg:flex-row items-center justify-center overflow-hidden py-8 min-h-screen bg-white -mt-8",
      className
    )}>
      {/* Hero image absolutely positioned on the right, outside the container */}
      <div className="hidden lg:block absolute right-4 md:right-8 lg:right-16 top-1/2 -translate-y-[55%] h-auto z-0">
        {/* Invisible container around the hero image */}
        <div className="w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] md:w-[45vw] md:h-[45vw] md:max-w-[600px] md:max-h-[600px] bg-transparent p-0 shadow-none border-none flex items-center justify-end">
          <img
            src="/heropage.png"
            alt="Hero Graphic"
            className="object-contain w-full h-full rounded-2xl"
            draggable={false}
          />
        </div>
      </div>
      {/* Container around the text content for visual separation */}
      <div className="w-full h-full relative z-10 flex flex-col justify-center items-center lg:items-start px-4 sm:px-8 md:px-12 lg:px-0">
        <div className="flex flex-col lg:flex-row items-center justify-center w-full h-full space-y-8 lg:space-y-0 lg:gap-16">
          {/* Left: Title and content with styled container */}
          <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-8 h-full pl-0 lg:pl-0 lg:ml-20 xl:ml-40">
            {/* Invisible container around the text content, with responsive max-width and break-words to prevent overlap */}
            <div className="w-full max-w-3xl bg-transparent p-0 shadow-none border-none break-words lg:max-w-[calc(100vw-700px)] xl:max-w-[calc(100vw-900px)]">
              {/* Main Title */}
              <div className="space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tighter leading-tight text-[#0A2F1F] break-words">
                  <span className="block mb-2">
                    <span
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, #0A2F1F, var(--midnight-700), var(--midnight-600), var(--midnight-500), var(--midnight-600), var(--midnight-700), #0A2F1F)',
                        backgroundSize: '400% 100%',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block',
                        backgroundColor: 'rgba(255,255,255,0.0)', // transparent background
                        paddingBottom: '0.25em', // add space below to prevent cropping
                        lineHeight: 1.1, // slightly increase line height
                      }}
                    >
                      Empowering
                    </span>
                  </span>
                  <motion.span
                    className="block"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #0A2F1F, var(--midnight-700), var(--midnight-600), var(--midnight-500), var(--midnight-600), var(--midnight-700), #0A2F1F)',
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
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#0A2F1F]/90 max-w-3xl leading-relaxed break-words">
                {data.description}
              </p>

              {/* Rotating Statements */}
              <div className="min-h-[32px] md:min-h-[36px] lg:min-h-[40px] flex items-center justify-center lg:justify-start">
                {shuffledStatements.length > 0 && (
                  <motion.div
                    key={shuffledStatements[currentStatement]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: fade ? 1 : 0, y: fade ? 0 : -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-[#0A2F1F]/80 text-base md:text-lg lg:text-xl font-medium"
                    aria-live="polite"
                  >
                    {shuffledStatements[currentStatement]}
                  </motion.div>
                )}
              </div>

              {/* Call-to-Action Button */}
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link
                  href={data.ctaLink}
                  className="relative group"
                >
                  <span className="relative z-10 inline-flex items-center gap-2 px-4 lg:px-6 xl:px-8 py-2 lg:py-3 font-medium text-white rounded-full overflow-hidden whitespace-nowrap text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-h-[44px] sm:min-h-[48px]">
                    {data.ctaText}
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <span className="absolute inset-0 rounded-full bg-primary transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_rgba(14,101,55,0.4)]"></span>
                </Link>
              </div>
            </div>
          </div>
          {/* Right: Hero Image (hidden on lg and up, visible on mobile/tablet) */}
          <div className="flex-1 relative flex items-center justify-end w-full h-full lg:hidden mt-8 sm:mt-0">
            {/* Invisible container around the hero image */}
            <div className="w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] sm:w-[45vw] sm:h-[45vw] sm:max-w-[600px] sm:max-h-[600px] bg-transparent p-0 shadow-none border-none rounded-2xl overflow-hidden flex items-center justify-end">
              <img
                src="/heropage.png"
                alt="Hero Graphic"
                className="object-contain w-full h-full rounded-2xl"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}