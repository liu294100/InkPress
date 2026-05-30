import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

/**
 * Custom rehype plugin that wraps drawio code blocks with a special div marker.
 * The DrawIODiagram component (implemented in a separate task) will pick up
 * these markers and render the diagrams.
 *
 * Transforms:
 *   <pre><code class="language-drawio">...</code></pre>
 * Into:
 *   <div class="drawio-diagram" data-xml="..."></div>
 */
export function rehypeDrawio() {
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

        if (className && className.includes('language-drawio')) {
          const xmlContent = getTextContent(codeNode);

          const drawioDiv: Element = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['drawio-diagram'],
              'data-xml': xmlContent,
            },
            children: [],
          };

          if (parent && typeof index === 'number') {
            (parent.children as Element[])[index] = drawioDiv;
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
