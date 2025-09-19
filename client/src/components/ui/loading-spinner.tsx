import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'cyber' | 'neon' | 'pulse';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: LoadingSpinnerProps) {
  const baseClasses = "animate-spin";
  const sizeClass = sizeClasses[size];

  const getVariantClasses = () => {
    switch (variant) {
      case 'cyber':
        return 'text-primary border-primary border-t-transparent';
      case 'neon':
        return 'text-primary border-primary border-t-transparent neon-glow-sm';
      case 'pulse':
        return 'text-primary animate-pulse';
      default:
        return 'text-primary border-primary border-t-transparent';
    }
  };

  if (variant === 'pulse') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("rounded-full bg-primary", sizeClass, "animate-pulse")} />
        {text && (
          <span className="ml-2 text-sm text-muted-foreground animate-pulse">
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full border-2",
          sizeClass,
          baseClasses,
          getVariantClasses()
        )}
      />
      {text && (
        <span className="ml-2 text-sm text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  variant?: 'default' | 'cyber' | 'neon';
  className?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ 
  isLoading, 
  text = "Loading...", 
  variant = 'default',
  className,
  children 
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size="lg" variant={variant} />
          <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'cyber' | 'neon';
}

export function LoadingButton({ 
  isLoading = false, 
  loadingText = "Loading...", 
  children, 
  variant = 'default',
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "relative inline-flex items-center justify-center",
        "px-4 py-2 rounded-md font-medium",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === 'cyber' && "neon-button",
        variant === 'neon' && "neon-glow-sm hover:neon-glow-md",
        className
      )}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" variant={variant} />
          <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface LoadingCardProps {
  isLoading: boolean;
  loadingText?: string;
  variant?: 'default' | 'cyber' | 'neon';
  className?: string;
  children: React.ReactNode;
}

export function LoadingCard({ 
  isLoading, 
  loadingText = "Loading...", 
  variant = 'default',
  className,
  children 
}: LoadingCardProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn("glass-card p-8 text-center", className)}>
      <LoadingSpinner size="lg" variant={variant} />
      <p className="mt-4 text-sm text-muted-foreground">{loadingText}</p>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  animation = 'pulse' 
}: SkeletonProps) {
  const baseClasses = "bg-muted animate-pulse";
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted';
      case 'none':
        return '';
      case 'pulse':
      default:
        return 'animate-pulse';
    }
  };

  return (
    <div
      className={cn(
        baseClasses,
        getVariantClasses(),
        getAnimationClasses(),
        className
      )}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={cn(
            index === lines - 1 && "w-3/4" // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}
