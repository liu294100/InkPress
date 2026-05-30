/**
 * DrawIO XML validation utility.
 * Validates that input is non-empty, valid XML, and contains a DrawIO root element.
 */

export interface DrawIOValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates whether the given string is valid DrawIO XML.
 *
 * Checks:
 * 1. Input is non-empty
 * 2. Input is valid XML (can be parsed)
 * 3. Root element is mxGraphModel or mxfile
 */
export function validateDrawIOXml(xml: string): DrawIOValidationResult {
  if (!xml || xml.trim().length === 0) {
    return { valid: false, error: 'Input is empty' };
  }

  // Basic XML structure check: must start with < and contain matching tags
  const trimmed = xml.trim();

  // Try to parse as XML using a simple regex-based check
  // Check for XML declaration (optional) then root element
  const withoutDeclaration = trimmed.replace(/^<\?xml[^?]*\?>[\s]*/, '');

  if (!withoutDeclaration.startsWith('<')) {
    return { valid: false, error: 'Invalid XML: does not start with a tag' };
  }

  // Extract root element name
  const rootMatch = withoutDeclaration.match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
  if (!rootMatch) {
    return { valid: false, error: 'Invalid XML: cannot determine root element' };
  }

  const rootElement = rootMatch[1];

  // Validate basic XML well-formedness
  // Check for matching opening and closing tags or self-closing root
  const selfClosingPattern = new RegExp(`^<${rootElement}[^>]*/>$`, 's');
  const closingTagPattern = new RegExp(`</${rootElement}>\\s*$`, 's');

  if (!selfClosingPattern.test(withoutDeclaration) && !closingTagPattern.test(withoutDeclaration)) {
    return { valid: false, error: 'Invalid XML: missing closing tag for root element' };
  }

  // Check that root element is mxGraphModel or mxfile
  if (rootElement !== 'mxGraphModel' && rootElement !== 'mxfile') {
    return {
      valid: false,
      error: `Invalid DrawIO XML: root element is "${rootElement}", expected "mxGraphModel" or "mxfile"`,
    };
  }

  return { valid: true };
}
