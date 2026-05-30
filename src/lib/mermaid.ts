/**
 * Mermaid diagram utilities for syntax pre-validation.
 *
 * This module provides a lightweight pre-check for Mermaid syntax without
 * requiring the full mermaid.js library (which is browser-only).
 */

/** Supported Mermaid diagram type keywords */
const SUPPORTED_DIAGRAM_TYPES = [
  'graph',
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'journey',
  'gantt',
  'pie',
  'quadrantChart',
  'requirementDiagram',
  'gitGraph',
  'mindmap',
  'timeline',
  'zenuml',
  'sankey-beta',
  'xychart-beta',
  'block-beta',
] as const;

export interface MermaidValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that a string looks like valid Mermaid syntax by checking
 * that it starts with a recognized diagram type keyword.
 *
 * This is a lightweight pre-check. Full syntax validation happens at
 * render time via the mermaid.js library.
 */
export function validateMermaidSyntax(chart: string): MermaidValidationResult {
  if (!chart || typeof chart !== 'string') {
    return { valid: false, error: 'Chart definition is empty or not a string' };
  }

  const trimmed = chart.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Chart definition is empty' };
  }

  // Extract the first word/token from the chart definition
  const firstLine = trimmed.split('\n')[0].trim();
  const firstToken = firstLine.split(/[\s{(\[;]/)[0].toLowerCase();

  // Check if the first token matches a supported diagram type
  const isKnownType = SUPPORTED_DIAGRAM_TYPES.some(
    (type) => type.toLowerCase() === firstToken
  );

  if (!isKnownType) {
    return {
      valid: false,
      error: `Unknown diagram type: "${firstToken}". Supported types: ${SUPPORTED_DIAGRAM_TYPES.slice(0, 6).join(', ')}...`,
    };
  }

  return { valid: true };
}
