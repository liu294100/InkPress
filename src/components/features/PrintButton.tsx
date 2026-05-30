'use client';

/**
 * PrintButton component - triggers the browser's native print dialog.
 *
 * The print stylesheet (src/styles/print.css) handles:
 * - Hiding navigation, sidebar, ads, and footer
 * - Formatting content for standard paper sizes (A4, Letter)
 * - Preserving code blocks, tables, and images in a readable format
 *
 * Validates: Requirements 17.1, 17.2, 17.3, 17.4
 */
export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="print-button inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg
                 bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-800
                 text-secondary-700 dark:text-secondary-200
                 transition-colors duration-300 ease-in-out
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      aria-label="Print this page"
      type="button"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
    </button>
  );
}
