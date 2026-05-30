'use client';

import { useState, useCallback } from 'react';

export interface PdfExportProps {
  contentRef: React.RefObject<HTMLElement>;
  title: string;
  fileName: string;
}

export default function PdfExport({ contentRef, title, fileName }: PdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = useCallback(async () => {
    if (!contentRef.current) return;

    setIsGenerating(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const element = contentRef.current;
      const generationDate = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const opt = {
        margin: [20, 15, 20, 15], // top, right, bottom, left in mm
        filename: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf: any) => {
          const totalPages = pdf.internal.getNumberOfPages();
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            // Header: document title
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text(title, 15, 10);

            // Footer: generation date and page number
            pdf.text(
              `Generated: ${generationDate}`,
              15,
              pageHeight - 10
            );
            pdf.text(
              `Page ${i} of ${totalPages}`,
              pageWidth - 40,
              pageHeight - 10
            );
          }
        })
        .save();
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [contentRef, title, fileName]);

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 min-w-[44px] min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg
        bg-blue-600 text-white hover:bg-blue-700 
        dark:bg-blue-500 dark:hover:bg-blue-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200"
      aria-label="Export to PDF"
    >
      {isGenerating ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
}
