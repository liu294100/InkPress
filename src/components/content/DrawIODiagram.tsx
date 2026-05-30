'use client';

import { validateDrawIOXml } from '@/lib/drawio';

export interface DrawIODiagramProps {
  xml: string; // DrawIO XML content
}

/**
 * DrawIO diagram component that renders DrawIO XML content using
 * the official DrawIO embed viewer via an iframe.
 *
 * Validates the XML input and displays a fallback error message
 * if the content is not valid DrawIO XML.
 */
export default function DrawIODiagram({ xml }: DrawIODiagramProps) {
  const validation = validateDrawIOXml(xml);

  if (!validation.valid) {
    return (
      <div className="drawio-error rounded-md border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        Diagram cannot be rendered
      </div>
    );
  }

  // Encode the XML content for the DrawIO embed viewer URL
  const encodedXml = encodeURIComponent(xml);
  const viewerUrl = `https://viewer.diagrams.net/?highlight=0000ff&nav=1&xml=${encodedXml}`;

  return (
    <div className="drawio-diagram my-4">
      <iframe
        src={viewerUrl}
        width="100%"
        height="480"
        style={{ border: 'none', minHeight: '300px' }}
        title="DrawIO Diagram"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
    </div>
  );
}
