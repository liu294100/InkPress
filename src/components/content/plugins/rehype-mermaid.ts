import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

/**
 * Custom rehype plugin that wraps mermaid code blocks with a special div marker.
 * The MermaidDiagram component (implemented in a separate task) will pick up
 * these markers and render the diagrams client-side.
 *
 * Transforms:
 *   <pre><code class="language-mermaid">...</code></pre>
 * Into:
 *   <div class="mermaid-diagram" data-chart="..."></div>
 */
export function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children.length === 1 &&
        isElement(node.children[0]) &&
        node.children[0].tagName === 'code'
      ) {
        const codeNode = node.children[0] as Element;
        const className = getClassName(codeNode);

        if (className && className.includes('language-mermaid')) {
          const chartContent = getTextContent(codeNode);

          const mermaidDiv: Element = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['mermaid-diagram'],
              'data-chart': chartContent,
            },
            children: [],
          };

          if (parent && typeof index === 'number') {
            (parent.children as Element[])[index] = mermaidDiv;
          }
        }
      }
    });
  };
}

function isElement(node: unknown): node is Element {
  return (node as Element)?.type === 'element';
}

function getClassName(node: Element): string | undefined {
  const props = node.properties;
  if (!props) return undefined;
  const className = props.className;
  if (Array.isArray(className)) return className.join(' ');
  if (typeof className === 'string') return className;
  return undefined;
}

function getTextContent(node: Element): string {
  let text = '';
  visit({ type: 'root', children: [node] } as Root, 'text', (textNode) => {
    text += (textNode as unknown as { value: string }).value;
  });
  return text;
}
