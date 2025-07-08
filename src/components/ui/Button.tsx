import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { cn } from '../utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost';

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors text-base cursor-pointer';

function getVariantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary';
    case 'secondary':
      return 'bg-secondary text-gray-900 hover:bg-secondary/80 focus-visible:ring-secondary';
    case 'accent':
      return 'bg-accent text-gray-900 hover:bg-accent/80 focus-visible:ring-accent';
    case 'outline':
      return 'border border-gray-300 text-gray-600 hover:text-primary hover:border-primary focus-visible:ring-primary';
    case 'ghost':
      return 'text-gray-600 hover:text-primary focus-visible:ring-primary';
    default:
      return '';
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, getVariantClasses(variant), className)}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button'; 