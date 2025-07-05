import type { AppError, ErrorHandler } from '@/types/errors';

export class ErrorManager {
  private static instance: ErrorManager;
  private errorHandlers: Map<string, ErrorHandler> = new Map();
  private errorQueue: AppError[] = [];
  private isProcessing = false;

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  registerHandler(type: string, handler: ErrorHandler): void {
    this.errorHandlers.set(type, handler);
  }

  handleError(error: AppError): void {
    this.errorQueue.push(error);
    if (!this.isProcessing) {
      this.processErrorQueue();
    }
  }

  private async processErrorQueue(): Promise<void> {
    this.isProcessing = true;
    
    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift();
      if (!error) continue;

      const handler = this.errorHandlers.get(error.type);
      if (handler) {
        try {
          await handler(error);
        } catch (handlerError) {
          console.error('Error handler failed:', handlerError);
          this.handleDefault(error);
        }
      } else {
        this.handleDefault(error);
      }
    }
    
    this.isProcessing = false;
  }

  private handleDefault(error: AppError): void {
    console.error('Unhandled error:', error);
    
    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // this.reportError(error);
    }
  }

  private async reportError(error: AppError): Promise<void> {
    // Implementation for error reporting service
    // e.g., Sentry, LogRocket, etc.
    try {
      // Example: Send to external error reporting service
      // await fetch('/api/error-reporting', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  // Clear all error handlers
  clearHandlers(): void {
    this.errorHandlers.clear();
  }

  // Get registered handler types
  getRegisteredTypes(): string[] {
    return Array.from(this.errorHandlers.keys());
  }

  // Check if a handler is registered for a specific type
  hasHandler(type: string): boolean {
    return this.errorHandlers.has(type);
  }
} 