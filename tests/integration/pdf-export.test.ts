/**
 * Integration test: PDF Export functionality.
 * Since html2pdf.js requires a browser environment, this test verifies:
 * - The PdfExport component exports properly
 * - The html2pdf type declarations exist and are correct
 * - The component interface is correct
 *
 * Validates: Requirements 15.1
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

describe('Integration: PDF Export', () => {
  describe('PdfExport component module', () => {
    it('should export PdfExport as default export', async () => {
      // Dynamic import to verify module structure
      const mod = await import('../../src/components/features/PdfExport');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should export PdfExportProps interface type', async () => {
      // Verify the module has named exports for the interface
      // TypeScript interfaces are erased at runtime, but we can check
      // that the component function exists and is a valid React component
      const mod = await import('../../src/components/features/PdfExport');
      const PdfExport = mod.default;

      // React function components have a name
      expect(PdfExport.name).toBe('PdfExport');
    });
  });

  describe('html2pdf.js type declarations', () => {
    it('should have a type declaration file for html2pdf.js', () => {
      const typeDeclPath = resolve(
        process.cwd(),
        'src/types/html2pdf.d.ts'
      );
      expect(existsSync(typeDeclPath)).toBe(true);
    });

    it('should declare the html2pdf.js module', () => {
      const typeDeclPath = resolve(
        process.cwd(),
        'src/types/html2pdf.d.ts'
      );
      const content = readFileSync(typeDeclPath, 'utf-8');

      // Verify module declaration
      expect(content).toContain("declare module 'html2pdf.js'");
    });

    it('should declare Html2PdfOptions interface', () => {
      const typeDeclPath = resolve(
        process.cwd(),
        'src/types/html2pdf.d.ts'
      );
      const content = readFileSync(typeDeclPath, 'utf-8');

      expect(content).toContain('interface Html2PdfOptions');
      expect(content).toContain('margin?');
      expect(content).toContain('filename?');
      expect(content).toContain('image?');
      expect(content).toContain('html2canvas?');
      expect(content).toContain('jsPDF?');
      expect(content).toContain('pagebreak?');
    });

    it('should declare Html2PdfInstance interface with fluent API', () => {
      const typeDeclPath = resolve(
        process.cwd(),
        'src/types/html2pdf.d.ts'
      );
      const content = readFileSync(typeDeclPath, 'utf-8');

      expect(content).toContain('interface Html2PdfInstance');
      expect(content).toContain('set(options: Html2PdfOptions): Html2PdfInstance');
      expect(content).toContain('from(element: HTMLElement | string): Html2PdfInstance');
      expect(content).toContain('toPdf(): Html2PdfInstance');
      expect(content).toContain('save(): Promise<void>');
    });

    it('should declare default export function', () => {
      const typeDeclPath = resolve(
        process.cwd(),
        'src/types/html2pdf.d.ts'
      );
      const content = readFileSync(typeDeclPath, 'utf-8');

      expect(content).toContain('export default html2pdf');
    });
  });

  describe('PdfExport component interface', () => {
    it('should accept contentRef, title, and fileName props', async () => {
      // We can verify the component source accepts the right props
      const componentPath = resolve(
        process.cwd(),
        'src/components/features/PdfExport.tsx'
      );
      const source = readFileSync(componentPath, 'utf-8');

      // Verify the PdfExportProps interface is defined
      expect(source).toContain('export interface PdfExportProps');
      expect(source).toContain('contentRef: React.RefObject<HTMLElement>');
      expect(source).toContain('title: string');
      expect(source).toContain('fileName: string');
    });

    it('should use html2pdf.js via dynamic import', async () => {
      const componentPath = resolve(
        process.cwd(),
        'src/components/features/PdfExport.tsx'
      );
      const source = readFileSync(componentPath, 'utf-8');

      // Verify dynamic import for code splitting
      expect(source).toContain("import('html2pdf.js')");
    });

    it('should include loading state management', async () => {
      const componentPath = resolve(
        process.cwd(),
        'src/components/features/PdfExport.tsx'
      );
      const source = readFileSync(componentPath, 'utf-8');

      // Verify loading indicator state
      expect(source).toContain('isGenerating');
      expect(source).toContain('setIsGenerating');
      expect(source).toContain('useState(false)');
    });

    it('should include document title and date in PDF header/footer', async () => {
      const componentPath = resolve(
        process.cwd(),
        'src/components/features/PdfExport.tsx'
      );
      const source = readFileSync(componentPath, 'utf-8');

      // Verify title and date are included in the PDF
      expect(source).toContain('title');
      expect(source).toContain('generationDate');
      expect(source).toContain('toLocaleDateString');
    });

    it('should configure A4 format for PDF output', async () => {
      const componentPath = resolve(
        process.cwd(),
        'src/components/features/PdfExport.tsx'
      );
      const source = readFileSync(componentPath, 'utf-8');

      expect(source).toContain("format: 'a4'");
      expect(source).toContain("orientation: 'portrait'");
    });
  });
});
