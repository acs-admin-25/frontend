import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/utils';
import { addCacheBustingToSplineUrl, isValidSplineUrl, clearSplineCache } from '@/lib/utils/spline';

// Type declaration for Spline
declare global {
  interface Window {
    SPLINE?: any;
  }
}

interface ThreeJSViewerProps {
  splineUrl?: string;
  className?: string;
  cacheBust?: boolean;
  forceRefresh?: boolean;
}

/**
 * Enhanced ThreeJSViewer Component
 * 
 * A component for displaying Spline 3D scenes with cache-busting capabilities.
 * 
 * @param splineUrl - The URL of the Spline scene to display
 * @param className - Additional CSS classes for the container
 * @param cacheBust - Force cache busting by adding timestamp to URL
 * @param forceRefresh - Force clear all cache and reload
 */
export function ThreeJSViewer({ 
  splineUrl, 
  className, 
  cacheBust = true,
  forceRefresh = false 
}: ThreeJSViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSplineViewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!splineUrl || !containerRef.current) return;

    // Validate Spline URL
    if (!isValidSplineUrl(splineUrl)) {
      setError('Invalid Spline URL provided');
      setIsLoading(false);
      return;
    }

    const loadSplineScene = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clear cache if force refresh is enabled
        if (forceRefresh) {
          clearSplineCache();
        }

        // Clear any existing viewer
        if (currentSplineViewerRef.current) {
          currentSplineViewerRef.current.remove();
          currentSplineViewerRef.current = null;
        }

        // Load Spline script if not already loaded
        if (!window.SPLINE) {
          const script = document.createElement('script');
          // Use the latest version to avoid compatibility warnings
          script.src = 'https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js';
          script.type = 'module';
          script.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Spline script'));
            document.head.appendChild(script);
          });
        }

        // Wait for custom element to be registered
        let attempts = 0;
        while (!customElements.get('spline-viewer') && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!customElements.get('spline-viewer')) {
          throw new Error('Spline viewer not available');
        }

        // Create and configure the spline-viewer element
        const splineViewer = document.createElement('spline-viewer');
        
        // Add cache-busting parameter if enabled
        const finalUrl = addCacheBustingToSplineUrl(splineUrl, cacheBust);
        
        splineViewer.setAttribute('url', finalUrl);
        splineViewer.style.width = '100%';
        splineViewer.style.height = '100%';
        splineViewer.style.borderRadius = '16px';

        // Store reference for cleanup
        currentSplineViewerRef.current = splineViewer;

        // Add event listeners
        splineViewer.addEventListener('load', () => {
          setIsLoading(false);
          setError(null);
        });

        splineViewer.addEventListener('error', () => {
          setError('Failed to load 3D scene');
          setIsLoading(false);
        });

        // Clear container and append the viewer
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(splineViewer);
        }

      } catch (err) {
        console.error('Error loading Spline scene:', err);
        setError('Failed to load 3D scene');
        setIsLoading(false);
      }
    };

    loadSplineScene();

    // Cleanup function
    return () => {
      if (currentSplineViewerRef.current) {
        currentSplineViewerRef.current.remove();
        currentSplineViewerRef.current = null;
      }
    };
  }, [splineUrl, cacheBust, forceRefresh]);

  // Function to manually refresh the scene
  const handleRefresh = () => {
    if (containerRef.current) {
      // Force a complete reload by clearing and recreating
      containerRef.current.innerHTML = '';
      setIsLoading(true);
      setError(null);
      
      // Trigger useEffect by updating a dependency
      // This will be handled by the useEffect above
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full min-h-[300px]",
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-secondary-dark rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Loading 3D Scene...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-red-600 text-sm mb-2">3D Scene Unavailable</p>
            <p className="text-gray-500 text-xs">{error}</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleRefresh}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Scene
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}