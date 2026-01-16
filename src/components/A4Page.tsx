import React from 'react';
import { cn } from '@/lib/utils';
import { PrintSettings } from '@/types/print';

interface A4PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  printSettings?: PrintSettings;
}

export const A4Page = React.forwardRef<HTMLDivElement, A4PageProps>(
  ({ children, className, printSettings, ...props }, ref) => {
    // Basic padding of 20mm
    const basePadding = "20mm";
    // If header/footer are enabled, we might need to adjust content padding or rely on the header/footer being absolute.
    // Absolute positioning is safer for fixed A4 headers/footers.

    return (
      <div
        ref={ref}
        className={cn(
          "a4-page relative mx-auto bg-white text-black shadow-lg mb-8 overflow-hidden flex flex-col",
          "print:shadow-none print:mb-0 print:mx-0 print:w-[210mm] print:min-h-[297mm] print:overflow-visible",
          className
        )}
        style={{
          width: '210mm',
          minHeight: '297mm',
          paddingTop: printSettings?.showHeader ? '35mm' : '20mm', // Add space for header
          paddingBottom: printSettings?.showFooter ? '30mm' : '20mm', // Add space for footer
          paddingLeft: '20mm',
          paddingRight: '20mm',
          boxSizing: 'border-box',
          pageBreakAfter: 'always',
          breakAfter: 'page',
          position: 'relative'
        }}
        {...props}
      >
        {/* Header */}
        {printSettings?.showHeader && (
          <div className="absolute top-0 left-0 w-full h-[30mm] px-[20mm] py-[10mm] flex items-center justify-between border-b border-transparent pointer-events-none">
            <div className="flex items-center gap-4">
              {printSettings.headerLogo && (
                <img src={printSettings.headerLogo} alt="" className="h-12 w-auto object-contain max-w-[150px]" />
              )}
              {printSettings.headerLeftText && (
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{printSettings.headerLeftText}</p>
              )}
            </div>
            <div className="text-right">
              {printSettings.headerRightText && (
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{printSettings.headerRightText}</p>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 w-full">
          {children}
        </div>

        {/* Footer */}
        {printSettings?.showFooter && (
          <div className="absolute bottom-0 left-0 w-full h-[25mm] px-[20mm] py-[5mm] flex items-center justify-between border-t border-transparent pointer-events-none">
            <div className="flex items-center gap-4">
              {printSettings.footerLogo && (
                <img src={printSettings.footerLogo} alt="" className="h-8 w-auto object-contain max-w-[100px]" />
              )}
              {printSettings.footerLeftText && (
                <p className="text-[10px] text-muted-foreground whitespace-pre-wrap">{printSettings.footerLeftText}</p>
              )}
            </div>
            <div className="text-right">
              {printSettings.footerRightText && (
                <p className="text-[10px] text-muted-foreground whitespace-pre-wrap">{printSettings.footerRightText}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

A4Page.displayName = 'A4Page';
