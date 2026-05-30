import { describe, it, expect } from 'vitest';
import { validateMermaidSyntax } from '../../../src/lib/mermaid';

describe('validateMermaidSyntax', () => {
  describe('valid diagrams', () => {
    it('should accept flowchart syntax', () => {
      const result = validateMermaidSyntax('flowchart TD\n  A --> B');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept graph syntax', () => {
      const result = validateMermaidSyntax('graph LR\n  A --> B --> C');
      expect(result.valid).toBe(true);
    });

    it('should accept sequenceDiagram syntax', () => {
      const result = validateMermaidSyntax('sequenceDiagram\n  Alice->>Bob: Hello');
      expect(result.valid).toBe(true);
    });

    it('should accept classDiagram syntax', () => {
      const result = validateMermaidSyntax('classDiagram\n  class Animal');
      expect(result.valid).toBe(true);
    });

    it('should accept stateDiagram syntax', () => {
      const result = validateMermaidSyntax('stateDiagram-v2\n  [*] --> Still');
      expect(result.valid).toBe(true);
    });

    it('should accept pie chart syntax', () => {
      const result = validateMermaidSyntax('pie\n  "Dogs" : 386');
      expect(result.valid).toBe(true);
    });

    it('should be case-insensitive for diagram type', () => {
      const result = validateMermaidSyntax('FLOWCHART TD\n  A --> B');
      expect(result.valid).toBe(true);
    });

    it('should handle leading whitespace', () => {
      const result = validateMermaidSyntax('  graph TD\n  A --> B');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid diagrams', () => {
    it('should reject empty string', () => {
      const result = validateMermaidSyntax('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validateMermaidSyntax('   \n   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject unknown diagram type', () => {
      const result = validateMermaidSyntax('unknownDiagram\n  A --> B');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown diagram type');
      expect(result.error).toContain('unknowndiagram');
    });

    it('should reject plain text', () => {
      const result = validateMermaidSyntax('Hello world this is not a diagram');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown diagram type');
    });

    it('should reject null-like values', () => {
      const result = validateMermaidSyntax(null as unknown as string);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty or not a string');
    });

    it('should reject undefined', () => {
      const result = validateMermaidSyntax(undefined as unknown as string);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty or not a string');
    });
  });
});
