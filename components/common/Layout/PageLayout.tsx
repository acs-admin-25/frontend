import React from 'react';
import { ErrorBoundary } from '../Feedback/ErrorBoundary';
import Footer from '@/app/Footer';
import { Logo } from '@/components/ui/Logo';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
  customFooter?: boolean;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export function PageLayout({
  children,
  title,
  description,
  showNavbar = true,
  showFooter = true,
  customFooter = false,
  className = '',
  maxWidth = 'lg',
  padding = 'md',
  fullHeight = false
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-8 py-12'
  };

  // If fullHeight is true, use full container dimensions
  if (fullHeight) {
    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        {showNavbar && (
          <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
            {/* Navbar content will be added here */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Logo />
                </div>
              </div>
            </div>
          </nav>
        )}
        
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ErrorBoundary>
            <div className={`flex-1 flex flex-col min-h-0 ${maxWidth === 'full' ? '' : 'mx-auto'} ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`}>
              {title && (
                <div className="mb-8 flex-shrink-0">
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  {description && (
                    <p className="mt-2 text-lg text-gray-600">{description}</p>
                  )}
                </div>
              )}
              <div className="flex-1 flex flex-col min-h-0">
                {children}
              </div>
            </div>
          </ErrorBoundary>
        </main>
        
        {showFooter && (
          customFooter ? (
            <div className="flex-shrink-0">
              <Footer />
            </div>
          ) : (
            <footer className="bg-white border-t border-gray-200 flex-shrink-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-gray-500">
                  <p>&copy; 2025 ACS. All rights reserved.</p>
                </div>
              </div>
            </footer>
          )
        )}
      </div>
    );
  }

  // Original layout for standalone pages
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          {/* Navbar content will be added here */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Logo />
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={`flex-1 ${className}`}>
        <ErrorBoundary>
          <div className={`${maxWidth === 'full' ? '' : 'mx-auto'} ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`}>
            {title && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="mt-2 text-lg text-gray-600">{description}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </ErrorBoundary>
      </main>
      
      {showFooter && (
        customFooter ? (
          <Footer />
        ) : (
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-500">
                <p>&copy; 2025 ACS. All rights reserved.</p>
              </div>
            </div>
          </footer>
        )
      )}
    </div>
  );
} 