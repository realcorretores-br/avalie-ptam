import React from 'react';
import { cn } from '@/lib/utils';

interface A4PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const A4Page = React.forwardRef<HTMLDivElement, A4PageProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "a4-page relative mx-auto bg-white text-black shadow-lg mb-8 overflow-hidden",
          "print:shadow-none print:mb-0 print:mx-0 print:w-full print:h-auto print:overflow-visible",
          className
        )}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          boxSizing: 'border-box',
          pageBreakAfter: 'always',
          breakAfter: 'page'
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

A4Page.displayName = 'A4Page';
