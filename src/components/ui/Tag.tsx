'use client';

import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getDeterministicColor } from '@/src/lib/colorUtils';

const tagVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
);

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function Tag({ className, label, onRemove, ...props }: TagProps) {
  const colorClasses = getDeterministicColor(label);

  return (
    <div className={cn(tagVariants(), colorClasses, className)} {...props}>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 -mr-1 flex items-center justify-center rounded-full text-current hover:bg-black/10"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export { Tag, tagVariants }; 