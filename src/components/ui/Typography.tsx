import { FC, HTMLAttributes } from 'react';
import { cn } from '../utils';

const baseHeading = 'font-medium text-gray-900';
const baseText = 'text-gray-600';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  className?: string;
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const createHeading = (tag: HeadingTag, sizeClass: string) => {
  const Heading: FC<TypographyProps> = ({ className, children, ...props }) => {
    const Tag = tag as any;
    return (
      <Tag className={cn(baseHeading, sizeClass, className)} {...props}>
        {children}
      </Tag>
    );
  };
  return Heading;
};

export const H1 = createHeading('h1', 'text-3xl');
export const H2 = createHeading('h2', 'text-2xl');
export const H3 = createHeading('h3', 'text-xl');
export const H4 = createHeading('h4', 'text-lg');

export const P: FC<TypographyProps> = ({ className, children, ...props }) => (
  <p className={cn(baseText, className)} {...props}>
    {children}
  </p>
);

export const Small: FC<TypographyProps> = ({ className, children, ...props }) => (
  <small className={cn('text-sm', className)} {...props}>
    {children}
  </small>
); 