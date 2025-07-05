/**
 * Spline Utilities
 * 
 * Utility functions for managing Spline 3D scenes and cache busting.
 */

/**
 * Adds cache-busting parameters to a Spline URL
 * @param url - The original Spline URL
 * @param forceRefresh - Whether to force a refresh with timestamp
 * @returns The URL with cache-busting parameters
 */
export function addCacheBustingToSplineUrl(url: string, forceRefresh: boolean = false): string {
  if (!forceRefresh) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

/**
 * Validates if a URL is a valid Spline URL
 * @param url - The URL to validate
 * @returns True if it's a valid Spline URL
 */
export function isValidSplineUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a Spline URL
  const splinePatterns = [
    /^https:\/\/prod\.spline\.design\/.+/,
    /^https:\/\/spline\.design\/.+/,
    /^https:\/\/my\.spline\.design\/.+/
  ];
  
  return splinePatterns.some(pattern => pattern.test(url));
}

/**
 * Extracts the scene ID from a Spline URL
 * @param url - The Spline URL
 * @returns The scene ID or null if not found
 */
export function extractSplineSceneId(url: string): string | null {
  if (!isValidSplineUrl(url)) return null;
  
  // Extract scene ID from URL patterns like:
  // https://prod.spline.design/uGlja6dguFbD3g1m/scene.splinecode
  const match = url.match(/\/([a-zA-Z0-9]+)\/scene\.splinecode/);
  return match ? match[1] : null;
}

/**
 * Creates a fresh Spline URL with cache busting
 * @param baseUrl - The base Spline URL
 * @returns A fresh URL with timestamp
 */
export function createFreshSplineUrl(baseUrl: string): string {
  return addCacheBustingToSplineUrl(baseUrl, true);
}

/**
 * Clears any cached Spline data from the browser
 */
export function clearSplineCache(): void {
  // Clear any stored Spline data
  if (typeof window !== 'undefined') {
    // Clear localStorage items that might contain Spline data
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('spline') || key.includes('Spline')
    );
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage items
    const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
      key.includes('spline') || key.includes('Spline')
    );
    
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
} 