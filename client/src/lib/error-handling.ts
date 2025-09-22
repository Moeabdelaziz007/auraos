export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class APIError extends CustomError {
  constructor(message: string, public status: number) {
    super(message);
    this.status = status;
  }
}

export class UIError extends CustomError {
  constructor(message: string) {
    super(message);
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof APIError) {
    // Handle API errors (e.g., show a toast)
    console.error(`API Error (${error.status}): ${error.message}`);
  } else if (error instanceof Error) {
    // Handle other errors
    console.error(`An unexpected error occurred: ${error.message}`);
  }
  return error; // It was not returning anything
};

export const ERROR_CODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  // Add other error codes as needed
};


interface ErrorHandlerOptions {
  logToConsole?: boolean;
  reportToService?: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error, options: ErrorHandlerOptions = {}) {
    const { logToConsole = true, reportToService = false } = options;

    if (logToConsole) {
      console.error("Caught by ErrorHandler:", error);
    }

    if (reportToService) {
      // Replace with your actual error reporting service (e.g., Sentry, Bugsnag)
      console.log("Reporting error to service...", error);
    }
  }
}
