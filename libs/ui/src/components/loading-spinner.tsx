'use client';

import { cn } from '../lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md', ...props }: LoadingSpinnerProps) {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div 
      className={cn("flex justify-center items-center py-8", className)} 
      {...props}
    >
      <div className="flex items-center space-x-2">
        <div
          className={cn("rounded-full bg-accent animate-bounce", dotSizes[size])}
          style={{ animationDelay: '0s' }}
        />
        <div
          className={cn("rounded-full bg-accent animate-bounce", dotSizes[size])}
          style={{ animationDelay: '0.1s' }}
        />
        <div
          className={cn("rounded-full bg-accent animate-bounce", dotSizes[size])}
          style={{ animationDelay: '0.2s' }}
        />
      </div>
    </div>
  );
}
