import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  validateField, 
  ValidationResult, 
  ValidationRule, 
  createDebouncedValidator 
} from '@/lib/validation';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validation?: ValidationRule;
  onValidationChange?: (result: ValidationResult) => void;
  showValidationOn?: 'blur' | 'change' | 'submit' | 'always';
  errorClassName?: string;
  successClassName?: string;
}

export function ValidatedInput({
  validation,
  onValidationChange,
  showValidationOn = 'blur',
  errorClassName,
  successClassName,
  className,
  onBlur,
  onChange,
  value,
  ...props
}: ValidatedInputProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: []
  });
  const [touched, setTouched] = useState(false);
  const [shouldShowValidation, setShouldShowValidation] = useState(false);

  const debouncedValidator = useCallback(
    createDebouncedValidator((val: any) => {
      if (!validation) return { isValid: true, errors: [] };
      return validateField(val, validation);
    }, 300),
    [validation]
  );

  useEffect(() => {
    if (!validation || !shouldShowValidation) return;

    const validate = () => {
      const result = validateField(value, validation);
      setValidationResult(result);
      onValidationChange?.(result);
    };

    if (showValidationOn === 'change' || showValidationOn === 'always') {
      debouncedValidator(value, validate);
    } else {
      validate();
    }
  }, [value, validation, shouldShowValidation, showValidationOn, debouncedValidator, onValidationChange]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (showValidationOn === 'blur' || showValidationOn === 'always') {
      setShouldShowValidation(true);
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showValidationOn === 'change' || showValidationOn === 'always') {
      setShouldShowValidation(true);
    }
    onChange?.(e);
  };

  const getInputClassName = () => {
    if (!shouldShowValidation || !validation) return className;

    if (validationResult.isValid && touched) {
      return cn(
        'border-green-500 focus:border-green-500 focus:ring-green-500',
        successClassName,
        className
      );
    }

    if (!validationResult.isValid && touched) {
      return cn(
        'border-destructive focus:border-destructive focus:ring-destructive',
        errorClassName,
        className
      );
    }

    return className;
  };

  return (
    <div className="space-y-1">
      <input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed',
          'disabled:opacity-50 transition-colors',
          getInputClassName()
        )}
      />
      
      {shouldShowValidation && validation && (
        <div className="space-y-1">
          {validationResult.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 text-xs text-destructive"
            >
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
          {validationResult.isValid && touched && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              <span>Valid</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  validation?: ValidationRule;
  onValidationChange?: (result: ValidationResult) => void;
  showValidationOn?: 'blur' | 'change' | 'submit' | 'always';
  errorClassName?: string;
  successClassName?: string;
}

export function ValidatedTextarea({
  validation,
  onValidationChange,
  showValidationOn = 'blur',
  errorClassName,
  successClassName,
  className,
  onBlur,
  onChange,
  value,
  ...props
}: ValidatedTextareaProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: []
  });
  const [touched, setTouched] = useState(false);
  const [shouldShowValidation, setShouldShowValidation] = useState(false);

  const debouncedValidator = useCallback(
    createDebouncedValidator((val: any) => {
      if (!validation) return { isValid: true, errors: [] };
      return validateField(val, validation);
    }, 300),
    [validation]
  );

  useEffect(() => {
    if (!validation || !shouldShowValidation) return;

    const validate = () => {
      const result = validateField(value, validation);
      setValidationResult(result);
      onValidationChange?.(result);
    };

    if (showValidationOn === 'change' || showValidationOn === 'always') {
      debouncedValidator(value, validate);
    } else {
      validate();
    }
  }, [value, validation, shouldShowValidation, showValidationOn, debouncedValidator, onValidationChange]);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true);
    if (showValidationOn === 'blur' || showValidationOn === 'always') {
      setShouldShowValidation(true);
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (showValidationOn === 'change' || showValidationOn === 'always') {
      setShouldShowValidation(true);
    }
    onChange?.(e);
  };

  const getTextareaClassName = () => {
    if (!shouldShowValidation || !validation) return className;

    if (validationResult.isValid && touched) {
      return cn(
        'border-green-500 focus:border-green-500 focus:ring-green-500',
        successClassName,
        className
      );
    }

    if (!validationResult.isValid && touched) {
      return cn(
        'border-destructive focus:border-destructive focus:ring-destructive',
        errorClassName,
        className
      );
    }

    return className;
  };

  return (
    <div className="space-y-1">
      <textarea
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          getTextareaClassName()
        )}
      />
      
      {shouldShowValidation && validation && (
        <div className="space-y-1">
          {validationResult.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 text-xs text-destructive"
            >
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
          {validationResult.isValid && touched && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              <span>Valid</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FormValidationSummaryProps {
  errors: Record<string, string[]>;
  className?: string;
}

export function FormValidationSummary({ errors, className }: FormValidationSummaryProps) {
  const allErrors = Object.values(errors).flat();

  if (allErrors.length === 0) return null;

  return (
    <div className={cn('glass-card border-destructive/20 bg-destructive/5 p-4', className)}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-destructive mb-2">
            Please fix the following errors:
          </h4>
          <ul className="space-y-1">
            {allErrors.map((error, index) => (
              <li key={index} className="text-sm text-destructive">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface ValidationStatusProps {
  isValid: boolean;
  isTouched: boolean;
  errors: string[];
  className?: string;
}

export function ValidationStatus({ isValid, isTouched, errors, className }: ValidationStatusProps) {
  if (!isTouched) return null;

  if (isValid) {
    return (
      <div className={cn('flex items-center space-x-1 text-xs text-green-600', className)}>
        <CheckCircle className="h-3 w-3" />
        <span>Valid</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {errors.map((error, index) => (
        <div
          key={index}
          className="flex items-center space-x-1 text-xs text-destructive"
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  required = false, 
  description, 
  error, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {children}
      
      {error && (
        <div className="flex items-center space-x-1 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}