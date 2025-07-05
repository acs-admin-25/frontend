import type { AppError } from '@/types/errors';

export function handleApiError(error: any): AppError {
  if (error.status === 401) {
    return {
      type: 'AUTH',
      message: 'Authentication required. Please log in again.',
      code: 'UNAUTHORIZED',
      status: 401,
      timestamp: new Date(),
    };
  }
  
  if (error.status === 403) {
    return {
      type: 'AUTH',
      message: 'You do not have permission to perform this action.',
      code: 'FORBIDDEN',
      status: 403,
      timestamp: new Date(),
    };
  }
  
  if (error.status === 404) {
    return {
      type: 'API',
      message: 'The requested resource was not found.',
      code: 'NOT_FOUND',
      status: 404,
      timestamp: new Date(),
    };
  }
  
  if (error.status === 500) {
    return {
      type: 'API',
      message: 'Internal server error. Please try again later.',
      code: 'INTERNAL_ERROR',
      status: 500,
      timestamp: new Date(),
    };
  }
  
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return {
      type: 'NETWORK',
      message: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      timestamp: new Date(),
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: error.message || 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date(),
  };
}

export function isApiError(error: any): error is AppError {
  return error && typeof error === 'object' && 'type' in error && 'message' in error;
}

export function createApiError(
  message: string,
  type: AppError['type'] = 'UNKNOWN',
  code?: string,
  status?: number
): AppError {
  return {
    type,
    message,
    code,
    status,
    timestamp: new Date(),
  };
} 