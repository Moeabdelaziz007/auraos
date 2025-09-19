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

export const handleAPIError = (error: unknown) => {
  if (error instanceof APIError) {
    // Handle API errors (e.g., show a toast)
    console.error(`API Error (${error.status}): ${error.message}`);
  } else if (error instanceof Error) {
    // Handle other errors
    console.error(`An unexpected error occurred: ${error.message}`);
  }
};
