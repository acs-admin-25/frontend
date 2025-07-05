import { apiClient } from '@/lib/api/client';

export interface DomainVerificationResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface DomainVerificationState {
  identityVerified: boolean;
  dkimVerified: boolean;
  identityLoading: boolean;
  dkimLoading: boolean;
  identityError: string | null;
  dkimError: string | null;
}

/**
 * Extract domain from email address
 */
export function extractDomainFromEmail(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
}

/**
 * Validate email format
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Verify domain identity using the centralized API client
 */
export async function verifyDomainIdentity(domain: string): Promise<DomainVerificationResult> {
  try {
    if (!domain) {
      return {
        success: false,
        message: 'Domain is required',
        error: 'Domain is required'
      };
    }

    const response = await apiClient.verifyDomain(domain);
    
    if (response.success) {
      return {
        success: true,
        message: 'Domain identity verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Domain identity verification failed',
        error: response.error || 'Unknown error occurred'
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: 'Failed to verify domain identity',
      error: errorMessage
    };
  }
}

/**
 * Verify domain DKIM using the centralized API client
 */
export async function verifyDomainDKIM(domain: string): Promise<DomainVerificationResult> {
  try {
    if (!domain) {
      return {
        success: false,
        message: 'Domain is required',
        error: 'Domain is required'
      };
    }

    const response = await apiClient.verifyDKIM(domain);
    
    if (response.success) {
      return {
        success: true,
        message: 'Domain DKIM verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Domain DKIM verification failed',
        error: response.error || 'Unknown error occurred'
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: 'Failed to verify domain DKIM',
      error: errorMessage
    };
  }
}

/**
 * Verify email validity using the centralized API client
 */
export async function verifyEmailValidity(uid: string, email: string): Promise<DomainVerificationResult> {
  try {
    if (!uid || !email) {
      return {
        success: false,
        message: 'User ID and email are required',
        error: 'User ID and email are required'
      };
    }

    if (!validateEmailFormat(email)) {
      return {
        success: false,
        message: 'Invalid email format',
        error: 'Invalid email format'
      };
    }

    const response = await apiClient.verifyEmailValidity(uid, email);
    
    if (response.success) {
      return {
        success: true,
        message: 'Email validity verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Email validity verification failed',
        error: response.error || 'Unknown error occurred'
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: 'Failed to verify email validity',
      error: errorMessage
    };
  }
} 