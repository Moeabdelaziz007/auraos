import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, className = "" }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`progress-bar ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="fill" style={{ width: `${pct}%` }} />
    </div>
  );
};

export default ProgressBar;

