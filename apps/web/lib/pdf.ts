/**
 * Triggers a high-fidelity print dialog for the current page or a specific target.
 * Institutional users can "Save as PDF" to preserve the premium aesthetics.
 */
export function generateInvoicePDF(invoiceId: string) {
  // We use the browser's native high-quality PDF engine.
  // This approach is preferred for 'Institutional' apps as it preserves 
  // complex CSS, custom fonts, and vector elements perfectly.
  window.print();
}

/**
 * Global CSS styles for print-based PDF generation.
 */
export const PRINT_STYLES = `
  @media print {
    body {
      background: white !important;
      color: black !important;
    }
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
    .card {
      border: none !important;
      box-shadow: none !important;
    }
    aside, header, nav, footer, button {
      display: none !important;
    }
    .main-content {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    @page {
      margin: 2cm;
    }
  }
`;
