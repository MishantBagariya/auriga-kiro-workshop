import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Domain-free presentational primitive. It takes a colour class from
 * the caller (see lib/labels.ts) and knows nothing about what a task
 * status or priority is.
 */
export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
