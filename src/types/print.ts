export interface PrintSettings {
    headerLeftText: string;
    headerRightText: string;
    footerLeftText: string;
    footerRightText: string;
    headerLogo?: string;
    footerLogo?: string;
    showHeader: boolean;
    showFooter: boolean;
}

export const defaultPrintSettings: PrintSettings = {
    headerLeftText: '',
    headerRightText: '',
    footerLeftText: '',
    footerRightText: '',
    showHeader: true,
    showFooter: true,
};
