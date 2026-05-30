import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  describe('preserves safe elements', () => {
    it('preserves paragraph tags', () => {
      const input = '<p>Hello world</p>';
      expect(sanitizeHtml(input)).toBe('<p>Hello world</p>');
    });

    it('preserves heading tags (h1-h6)', () => {
      expect(sanitizeHtml('<h1>Title</h1>')).toBe('<h1>Title</h1>');
      expect(sanitizeHtml('<h2>Subtitle</h2>')).toBe('<h2>Subtitle</h2>');
      expect(sanitizeHtml('<h3>Section</h3>')).toBe('<h3>Section</h3>');
      expect(sanitizeHtml('<h4>Sub-section</h4>')).toBe('<h4>Sub-section</h4>');
      expect(sanitizeHtml('<h5>Minor</h5>')).toBe('<h5>Minor</h5>');
      expect(sanitizeHtml('<h6>Smallest</h6>')).toBe('<h6>Smallest</h6>');
    });

    it('preserves text formatting tags', () => {
      expect(sanitizeHtml('<strong>bold</strong>')).toBe('<strong>bold</strong>');
      expect(sanitizeHtml('<em>italic</em>')).toBe('<em>italic</em>');
      expect(sanitizeHtml('<b>bold</b>')).toBe('<b>bold</b>');
      expect(sanitizeHtml('<i>italic</i>')).toBe('<i>italic</i>');
      expect(sanitizeHtml('<u>underline</u>')).toBe('<u>underline</u>');
    });

    it('preserves list elements', () => {
      const ul = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      expect(sanitizeHtml(ul)).toBe(ul);

      const ol = '<ol><li>First</li><li>Second</li></ol>';
      expect(sanitizeHtml(ol)).toBe(ol);
    });

    it('preserves table elements', () => {
      const table = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
      expect(sanitizeHtml(table)).toBe(table);
    });

    it('preserves links with safe href', () => {
      const link = '<a href="https://example.com">Link</a>';
      expect(sanitizeHtml(link)).toContain('href="https://example.com"');
      expect(sanitizeHtml(link)).toContain('Link</a>');
    });

    it('preserves images with safe src', () => {
      const img = '<img src="https://example.com/image.png" alt="Photo">';
      const result = sanitizeHtml(img);
      expect(result).toContain('src="https://example.com/image.png"');
      expect(result).toContain('alt="Photo"');
    });

    it('preserves code blocks', () => {
      const code = '<pre><code>const x = 1;</code></pre>';
      expect(sanitizeHtml(code)).toBe(code);
    });

    it('preserves blockquote elements', () => {
      const bq = '<blockquote>Quote text</blockquote>';
      expect(sanitizeHtml(bq)).toBe(bq);
    });

    it('preserves br and hr elements', () => {
      expect(sanitizeHtml('<br>')).toBe('<br>');
      expect(sanitizeHtml('<hr>')).toBe('<hr>');
    });

    it('preserves figure and figcaption', () => {
      const fig = '<figure><img src="https://example.com/img.jpg" alt="test"><figcaption>Caption</figcaption></figure>';
      const result = sanitizeHtml(fig);
      expect(result).toContain('<figure>');
      expect(result).toContain('<figcaption>Caption</figcaption>');
    });

    it('preserves safe attributes (class, id, style)', () => {
      const input = '<div class="container" id="main" style="color: red;">Content</div>';
      const result = sanitizeHtml(input);
      expect(result).toContain('class="container"');
      expect(result).toContain('id="main"');
      expect(result).toContain('style="color: red;"');
    });

    it('preserves span elements', () => {
      expect(sanitizeHtml('<span>text</span>')).toBe('<span>text</span>');
    });

    it('preserves div elements', () => {
      expect(sanitizeHtml('<div>content</div>')).toBe('<div>content</div>');
    });
  });

  describe('removes dangerous elements', () => {
    it('removes script tags and their content', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Hello</p>');
      expect(result).toContain('<p>World</p>');
    });

    it('removes iframe elements', () => {
      const input = '<p>Text</p><iframe src="https://evil.com"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('iframe');
      expect(result).toContain('<p>Text</p>');
    });

    it('removes object elements', () => {
      expect(sanitizeHtml('<object data="bad.swf"></object>')).not.toContain('<object');
    });

    it('removes embed elements', () => {
      expect(sanitizeHtml('<embed src="bad.swf">')).not.toContain('<embed');
    });

    it('removes form elements', () => {
      const input = '<form action="/steal"><input type="text"><button>Submit</button></form>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
      expect(result).not.toContain('<button');
    });

    it('removes textarea elements', () => {
      expect(sanitizeHtml('<textarea>Text</textarea>')).not.toContain('<textarea');
    });

    it('removes style tags and their content', () => {
      const input = '<style>body { display: none; }</style><p>Text</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<style');
      expect(result).not.toContain('display: none');
      expect(result).toContain('<p>Text</p>');
    });
  });

  describe('removes dangerous attributes', () => {
    it('removes onclick handler', () => {
      const input = '<p onclick="alert(1)">Click me</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click me</p>');
    });

    it('removes onload handler', () => {
      const input = '<img src="img.jpg" onload="alert(1)">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onload');
      expect(result).toContain('src="img.jpg"');
    });

    it('removes onerror handler', () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onerror');
    });

    it('removes onmouseover handler', () => {
      const input = '<div onmouseover="alert(1)">Hover</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('Hover</div>');
    });

    it('removes onfocus handler', () => {
      const input = '<div onfocus="alert(1)">Focus</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onfocus');
    });

    it('removes multiple event handlers from same element', () => {
      const input = '<div onclick="x()" onmouseover="y()" class="safe">Content</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('class="safe"');
      expect(result).toContain('Content</div>');
    });
  });

  describe('removes dangerous URLs', () => {
    it('removes javascript: URLs from href', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Click</a>');
    });

    it('removes javascript: URLs from img src', () => {
      const input = '<img src="javascript:alert(1)">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });

    it('handles mixed-case javascript: protocol', () => {
      const input = '<a href="JaVaScRiPt:alert(1)">Click</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript');
      expect(result).not.toContain('JaVaScRiPt');
    });

    it('removes vbscript: URLs', () => {
      const input = '<a href="vbscript:MsgBox(1)">Click</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('vbscript:');
    });

    it('removes data: URLs from src', () => {
      const input = '<img src="data:text/html,<script>alert(1)</script>">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('data:');
    });

    it('allows safe https URLs', () => {
      const input = '<a href="https://example.com">Safe</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="https://example.com"');
    });

    it('allows relative URLs', () => {
      const input = '<a href="/page/about">About</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="/page/about"');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('returns empty string for null-like input', () => {
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
      expect(sanitizeHtml(null as unknown as string)).toBe('');
    });

    it('handles plain text without HTML', () => {
      expect(sanitizeHtml('Hello, world!')).toBe('Hello, world!');
    });

    it('handles nested dangerous elements within safe ones', () => {
      const input = '<div><p>Safe <script>alert("xss")</script> text</p></div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('Safe');
      expect(result).toContain('text');
    });

    it('handles complex nested structures', () => {
      const input = [
        '<div class="article">',
        '<h1>Title</h1>',
        '<p>Paragraph with <strong>bold</strong> and <em>italic</em></p>',
        '<ul><li>Item 1</li><li>Item 2</li></ul>',
        '<script>document.cookie</script>',
        '<table><tr><th>Col 1</th></tr><tr><td>Data</td></tr></table>',
        '</div>',
      ].join('');
      const result = sanitizeHtml(input);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<th>Col 1</th>');
      expect(result).not.toContain('<script');
      expect(result).not.toContain('document.cookie');
    });

    it('preserves text content when unknown tags are stripped', () => {
      const input = '<custom>Inner text</custom>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<custom');
      expect(result).toContain('Inner text');
    });
  });
});
