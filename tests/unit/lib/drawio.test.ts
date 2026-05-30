import { describe, it, expect } from 'vitest';
import { validateDrawIOXml } from '@/lib/drawio';

describe('validateDrawIOXml', () => {
  describe('empty input handling', () => {
    it('should return invalid for empty string', () => {
      const result = validateDrawIOXml('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Input is empty');
    });

    it('should return invalid for whitespace-only string', () => {
      const result = validateDrawIOXml('   \n\t  ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Input is empty');
    });
  });

  describe('invalid XML detection', () => {
    it('should return invalid for plain text', () => {
      const result = validateDrawIOXml('hello world');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid XML');
    });

    it('should return invalid for unclosed tags', () => {
      const result = validateDrawIOXml('<mxGraphModel>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid XML');
    });

    it('should return invalid for malformed XML', () => {
      const result = validateDrawIOXml('<<<not xml>>>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid XML');
    });
  });

  describe('non-DrawIO XML detection', () => {
    it('should return invalid for valid XML with wrong root element', () => {
      const result = validateDrawIOXml('<html><body>Hello</body></html>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('root element is "html"');
      expect(result.error).toContain('expected "mxGraphModel" or "mxfile"');
    });

    it('should return invalid for SVG XML', () => {
      const result = validateDrawIOXml('<svg width="100" height="100"></svg>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('root element is "svg"');
    });
  });

  describe('valid DrawIO XML', () => {
    it('should return valid for mxGraphModel root element', () => {
      const xml = '<mxGraphModel><root><mxCell id="0"/></root></mxGraphModel>';
      const result = validateDrawIOXml(xml);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for mxfile root element', () => {
      const xml = '<mxfile><diagram name="Page-1"><mxGraphModel></mxGraphModel></diagram></mxfile>';
      const result = validateDrawIOXml(xml);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for self-closing mxGraphModel', () => {
      const xml = '<mxGraphModel/>';
      const result = validateDrawIOXml(xml);
      expect(result.valid).toBe(true);
    });

    it('should return valid for mxfile with attributes', () => {
      const xml = '<mxfile host="app.diagrams.net" modified="2024-01-01"><diagram></diagram></mxfile>';
      const result = validateDrawIOXml(xml);
      expect(result.valid).toBe(true);
    });

    it('should handle XML declaration before root element', () => {
      const xml = '<?xml version="1.0" encoding="UTF-8"?><mxGraphModel><root></root></mxGraphModel>';
      const result = validateDrawIOXml(xml);
      expect(result.valid).toBe(true);
    });

    it('should handle whitespace before root element', () => {
      const xml = '  \n  <mxGraphModel><root></root></mxGraphModel>';
      const result = validateDrawIOXml(xml);
      expect(result.valid).toBe(true);
    });
  });
});
