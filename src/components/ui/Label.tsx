import type { LabelHTMLAttributes } from 'react';
import { cn } from '../utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = ({ className, children, ...props }: LabelProps) => (
  <label
    className={cn('text-sm font-medium text-gray-900', className)}
    {...props}
  >
    {children}
  </label>
); 