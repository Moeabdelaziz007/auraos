// Validation utilities and schemas for AuraOS

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  url?: boolean;
  number?: boolean;
  integer?: boolean;
  positive?: boolean;
  date?: boolean;
  futureDate?: boolean;
  pastDate?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule;
  touched: boolean;
  errors: string[];
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must be no more than ${max} characters long`,
  pattern: 'Invalid format',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
  username: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores',
  password: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  alphanumeric: 'Only letters and numbers are allowed',
  hexColor: 'Please enter a valid hex color code',
  slug: 'Slug must contain only lowercase letters, numbers, and hyphens',
  number: 'Please enter a valid number',
  integer: 'Please enter a whole number',
  positive: 'Please enter a positive number',
  date: 'Please enter a valid date',
  futureDate: 'Please enter a future date',
  pastDate: 'Please enter a past date',
  custom: 'Invalid value'
};

/**
 * Validates a single field value against validation rules
 */
export function validateField(value: any, rules: ValidationRule): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required validation
  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push(VALIDATION_MESSAGES.required);
    return { isValid: false, errors, warnings };
  }

  // Skip other validations if value is empty and not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return { isValid: true, errors: [], warnings };
  }

  const stringValue = String(value).trim();

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(VALIDATION_MESSAGES.minLength(rules.minLength));
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(VALIDATION_MESSAGES.maxLength(rules.maxLength));
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(VALIDATION_MESSAGES.pattern);
  }

  // Email validation
  if (rules.email && !VALIDATION_PATTERNS.email.test(stringValue)) {
    errors.push(VALIDATION_MESSAGES.email);
  }

  // URL validation
  if (rules.url && !VALIDATION_PATTERNS.url.test(stringValue)) {
    errors.push(VALIDATION_MESSAGES.url);
  }

  // Number validation
  if (rules.number || rules.integer || rules.positive) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      errors.push(VALIDATION_MESSAGES.number);
    } else {
      if (rules.integer && !Number.isInteger(numValue)) {
        errors.push(VALIDATION_MESSAGES.integer);
      }
      if (rules.positive && numValue <= 0) {
        errors.push(VALIDATION_MESSAGES.positive);
      }
    }
  }

  // Date validation
  if (rules.date || rules.futureDate || rules.pastDate) {
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      errors.push(VALIDATION_MESSAGES.date);
    } else {
      const now = new Date();
      if (rules.futureDate && dateValue <= now) {
        errors.push(VALIDATION_MESSAGES.futureDate);
      }
      if (rules.pastDate && dateValue >= now) {
        errors.push(VALIDATION_MESSAGES.pastDate);
      }
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates multiple fields at once
 */
export function validateFields(fields: Record<string, FieldValidation>): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldName, field] of Object.entries(fields)) {
    results[fieldName] = validateField(field.value, field.rules);
  }

  return results;
}

/**
 * Checks if all fields are valid
 */
export function isFormValid(fields: Record<string, FieldValidation>): boolean {
  return Object.values(fields).every(field => {
    const result = validateField(field.value, field.rules);
    return result.isValid;
  });
}

/**
 * Gets all validation errors from fields
 */
export function getAllErrors(fields: Record<string, FieldValidation>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const [fieldName, field] of Object.entries(fields)) {
    const result = validateField(field.value, field.rules);
    if (!result.isValid) {
      errors[fieldName] = result.errors;
    }
  }

  return errors;
}

/**
 * Common validation rules for different field types
 */
export const COMMON_RULES: Record<string, ValidationRule> = {
  email: {
    required: true,
    email: true,
    maxLength: 254
  },
  password: {
    required: true,
    minLength: 8,
    pattern: VALIDATION_PATTERNS.password
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.username
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  title: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  description: {
    maxLength: 500
  },
  url: {
    url: true
  },
  phone: {
    pattern: VALIDATION_PATTERNS.phone
  },
  positiveNumber: {
    number: true,
    positive: true
  },
  integer: {
    integer: true
  },
  slug: {
    required: true,
    pattern: VALIDATION_PATTERNS.slug,
    minLength: 3,
    maxLength: 50
  }
};

/**
 * Debounced validation for real-time validation
 */
export function createDebouncedValidator(
  validateFn: (value: any) => ValidationResult,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (value: any, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validateFn(value);
      callback(result);
    }, delay);
  };
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize form data
 */
export function validateAndSanitizeForm(
  formData: Record<string, any>,
  rules: Record<string, ValidationRule>
): {
  isValid: boolean;
  data: Record<string, any>;
  errors: Record<string, string[]>;
} {
  const sanitizedData: Record<string, any> = {};
  const errors: Record<string, string[]> = {};
  let isValid = true;

  for (const [fieldName, value] of Object.entries(formData)) {
    const rule = rules[fieldName];
    if (!rule) continue;

    // Sanitize string values
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    sanitizedData[fieldName] = sanitizedValue;

    // Validate
    const result = validateField(sanitizedValue, rule);
    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }
  }

  return {
    isValid,
    data: sanitizedData,
    errors
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: Record<string, string[]>): string[] {
  const allErrors: string[] = [];
  
  for (const [fieldName, fieldErrors] of Object.entries(errors)) {
    allErrors.push(...fieldErrors);
  }
  
  return allErrors;
}
