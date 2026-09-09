import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import type { TestStatus } from '../types/report';

interface StatusBadgeProps {
  status: TestStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm md:text-base px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 15,
    lg: 18,
  };

  if (status === 'within_provided_range') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm ${sizeClasses[size]}`}
      >
        {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600 shrink-0" />}
        <span>Within Provided Range</span>
      </span>
    );
  }

  if (status === 'outside_provided_range') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm ${sizeClasses[size]}`}
      >
        {showIcon && <AlertCircle size={iconSizes[size]} className="text-rose-600 shrink-0" />}
        <span>Outside Provided Range</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm ${sizeClasses[size]}`}
    >
      {showIcon && <HelpCircle size={iconSizes[size]} className="text-amber-600 shrink-0" />}
      <span>Unable to Determine</span>
    </span>
  );
};
