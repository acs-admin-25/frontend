'use client';

import { useRouter } from 'next/navigation';

/**
 * Utility function to handle 404 error routing
 * @param code - Error code to display
 * @param message - Error message to display
 * @param router - Optional Next.js router instance. If not provided, will only set localStorage
 */
export const goto404 = (code: string, message: string, router?: ReturnType<typeof useRouter>) => {
  // Always set the error in localStorage
  
  // If router is provided, navigate to 404 page
  if (router) {
    localStorage.setItem('error', JSON.stringify({ code, message }));
    router.push('/404');
  } else {
    console.error('Router not provided to goto404. Error set in localStorage but no navigation occurred.');
    console.error(`Error Code: ${code}, Message: ${message}`);
  }
}; 