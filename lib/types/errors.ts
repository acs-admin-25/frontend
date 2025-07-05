export interface AppError {
  type: 'API' | 'AUTH' | 'VALIDATION' | 'NETWORK' | 'UNKNOWN';
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  status?: number;
}

export type ErrorHandler = (error: AppError) => void | Promise<void>;

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class CustomError extends Error {
  public type: AppError['type'];
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(
    message: string,
    type: AppError['type'] = 'UNKNOWN',
    code?: string,
    status?: number,
    details?: any
  ) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.code = code;
    this.status = status;
    this.details = details;
  }
} 