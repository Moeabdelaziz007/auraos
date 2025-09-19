// Comprehensive error handling utilities for AuraOS

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  fallbackMessage?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle errors with comprehensive logging and user feedback
   */
  handleError(
    error: Error | AppError | any,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const appError = this.normalizeError(error);
    
    // Add to error queue
    this.addToQueue(appError);

    // Log to console if enabled
    if (options.logToConsole !== false) {
      this.logError(appError);
    }

    // Report to external service if enabled
    if (options.reportToService) {
      this.reportError(appError);
    }

    return appError;
  }

  /**
   * Normalize different error types to AppError
   */
  private normalizeError(error: any): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return {
        code: 'GENERIC_ERROR',
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        details: {
          name: error.name,
          cause: (error as any).cause
        }
      };
    }

    if (typeof error === 'string') {
      return {
        code: 'STRING_ERROR',
        message: error,
        timestamp: new Date()
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      timestamp: new Date(),
      details: error
    };
  }

  private isAppError(error: any): error is AppError {
    return error && 
           typeof error.code === 'string' && 
           typeof error.message === 'string' && 
           error.timestamp instanceof Date;
  }

  private addToQueue(error: AppError): void {
    this.errorQueue.unshift(error);
    
    // Keep only the latest errors
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize);
    }
  }

  private logError(error: AppError): void {
    console.group('🚨 Error Handler');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Timestamp:', error.timestamp.toISOString());
    
    if (error.details) {
      console.error('Details:', error.details);
    }
    
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    
    if (error.context) {
      console.error('Context:', error.context);
    }
    
    console.groupEnd();
  }

  private reportError(error: AppError): void {
    // In a real app, you would send this to your error tracking service
    // like Sentry, LogRocket, or Bugsnag
    
    // Example implementation:
    /*
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
    */
    
    console.log('📊 Error reported to external service:', error.code);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorQueue.slice(0, count);
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = [];
  }
}

// Common error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // API errors
  API_ERROR: 'API_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Business logic errors
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // System errors
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

// Error messages mapping
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.CONNECTION_ERROR]: 'Unable to connect to the server.',
  
  [ERROR_CODES.AUTH_REQUIRED]: 'Please log in to continue.',
  [ERROR_CODES.AUTH_INVALID]: 'Invalid credentials. Please try again.',
  [ERROR_CODES.AUTH_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.AUTH_FORBIDDEN]: 'You do not have permission to perform this action.',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required.',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format. Please check your input.',
  
  [ERROR_CODES.API_ERROR]: 'An error occurred while processing your request.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  
  [ERROR_CODES.BUSINESS_ERROR]: 'Unable to complete the requested action.',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions.',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'This resource is already in use.',
  
  [ERROR_CODES.SYSTEM_ERROR]: 'A system error occurred. Please try again.',
  [ERROR_CODES.STORAGE_ERROR]: 'Unable to save data. Please try again.',
  [ERROR_CODES.CONFIGURATION_ERROR]: 'Configuration error. Please contact support.'
};

/**
 * Create a standardized error
 */
export function createError(
  code: string,
  message?: string,
  details?: any,
  context?: Record<string, any>
): AppError {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || 'An error occurred',
    details,
    timestamp: new Date(),
    context
  };
}

/**
 * Handle API errors specifically
 */
export function handleApiError(error: any): AppError {
  const errorHandler = ErrorHandler.getInstance();
  
  if (error.response) {
    // HTTP error response
    const { status, data } = error.response;
    
    let code = ERROR_CODES.API_ERROR;
    let message = ERROR_MESSAGES[code];
    
    switch (status) {
      case 400:
        code = ERROR_CODES.VALIDATION_ERROR;
        message = data?.message || ERROR_MESSAGES[code];
        break;
      case 401:
        code = ERROR_CODES.AUTH_REQUIRED;
        message = ERROR_MESSAGES[code];
        break;
      case 403:
        code = ERROR_CODES.AUTH_FORBIDDEN;
        message = ERROR_MESSAGES[code];
        break;
      case 404:
        code = ERROR_CODES.NOT_FOUND;
        message = ERROR_MESSAGES[code];
        break;
      case 429:
        code = ERROR_CODES.RATE_LIMITED;
        message = ERROR_MESSAGES[code];
        break;
      case 500:
        code = ERROR_CODES.SERVER_ERROR;
        message = ERROR_MESSAGES[code];
        break;
    }
    
    return errorHandler.handleError(createError(code, message, data, { status }));
  }
  
  if (error.request) {
    // Network error
    return errorHandler.handleError(
      createError(ERROR_CODES.NETWORK_ERROR, undefined, undefined, {
        url: error.config?.url,
        method: error.config?.method
      })
    );
  }
  
  // Other error
  return errorHandler.handleError(error);
}

/**
 * Handle validation errors
 */
export function handleValidationError(errors: Record<string, string[]>): AppError {
  const errorHandler = ErrorHandler.getInstance();
  
  const message = Object.values(errors)
    .flat()
    .join(', ');
    
  return errorHandler.handleError(
    createError(ERROR_CODES.VALIDATION_ERROR, message, errors)
  );
}

/**
 * Handle WebSocket errors
 */
export function handleWebSocketError(error: Event): AppError {
  const errorHandler = ErrorHandler.getInstance();
  
  return errorHandler.handleError(
    createError(ERROR_CODES.CONNECTION_ERROR, 'WebSocket connection failed', {
      type: error.type,
      target: error.target
    })
  );
}

/**
 * Retry mechanism for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: any) => void
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.handleError(error);
    
    if (onError) {
      onError(error);
    }
    
    return fallback;
  }
}

/**
 * Error boundary hook for functional components
 */
export function useErrorHandler() {
  const errorHandler = ErrorHandler.getInstance();
  
  return {
    handleError: (error: any, options?: ErrorHandlerOptions) => 
      errorHandler.handleError(error, options),
    
    createError,
    handleApiError,
    handleValidationError,
    handleWebSocketError,
    
    withRetry,
    safeAsync
  };
}
