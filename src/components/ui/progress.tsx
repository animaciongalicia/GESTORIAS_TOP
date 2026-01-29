'use client';

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  color?: string;
}

export function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  showLabel = false,
  color,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      <div
        className={cn(
          'h-2.5 w-full overflow-hidden rounded-full bg-gray-200',
          className
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            !color && 'bg-brand',
            indicatorClassName
          )}
          style={{
            width: `${percentage}%`,
            ...(color && { backgroundColor: color }),
          }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm text-gray-600 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
