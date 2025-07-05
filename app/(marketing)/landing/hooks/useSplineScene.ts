import React, { useState, useCallback, useEffect } from 'react';
import { createFreshSplineUrl, clearSplineCache, isValidSplineUrl } from '@/lib/utils/spline';

interface UseSplineSceneOptions {
  initialUrl?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseSplineSceneReturn {
  splineUrl: string | undefined;
  isLoading: boolean;
  error: string | null;
  refreshScene: () => void;
  updateUrl: (newUrl: string) => void;
  forceRefresh: () => void;
  clearCache: () => void;
}

/**
 * Custom hook for managing Spline 3D scenes
 * 
 * Provides utilities for loading, refreshing, and managing Spline scenes
 * with cache busting and error handling.
 */
export function useSplineScene(options: UseSplineSceneOptions = {}): UseSplineSceneReturn {
  const { 
    initialUrl, 
    autoRefresh = false, 
    refreshInterval = 300000 // 5 minutes default
  } = options;

  const [splineUrl, setSplineUrl] = useState<string | undefined>(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh the scene with cache busting
  const refreshScene = useCallback(() => {
    if (!splineUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    // Create a fresh URL with cache busting
    const freshUrl = createFreshSplineUrl(splineUrl);
    setSplineUrl(freshUrl);
    
    // Reset loading state after a short delay
    setTimeout(() => setIsLoading(false), 1000);
  }, [splineUrl]);

  // Function to update the URL
  const updateUrl = useCallback((newUrl: string) => {
    if (!isValidSplineUrl(newUrl)) {
      setError('Invalid Spline URL provided');
      return;
    }
    
    setError(null);
    setSplineUrl(newUrl);
  }, []);

  // Function to force refresh (clear cache and reload)
  const forceRefresh = useCallback(() => {
    clearSplineCache();
    refreshScene();
  }, [refreshScene]);

  // Function to clear cache
  const clearCache = useCallback(() => {
    clearSplineCache();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !splineUrl) return;

    const interval = setInterval(() => {
      refreshScene();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, splineUrl, refreshInterval, refreshScene]);

  return {
    splineUrl,
    isLoading,
    error,
    refreshScene,
    updateUrl,
    forceRefresh,
    clearCache
  };
} 