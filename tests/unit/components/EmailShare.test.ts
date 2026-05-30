import { describe, it, expect } from 'vitest';
import { generateMailtoLink } from '@/components/features/EmailShare';

describe('EmailShare - generateMailtoLink', () => {
  const title = 'Getting Started with TypeScript';
  const url = 'https://example.com/docs/typescript/getting-started';
  const excerpt = 'This guide covers the basics of TypeScript development.';

  it('generates a mailto: URI starting with mailto:?', () => {
    const result = generateMailtoLink(title, url, excerpt);
    expect(result.startsWith('mailto:?')).toBe(true);
  });

  it('includes the document title as the subject, URI-encoded', () => {
    const result = generateMailtoLink(title, url, excerpt);
    expect(result).toContain(`subject=${encodeURIComponent(title)}`);
  });

  it('includes the URL in the body, URI-encoded', () => {
    const result = generateMailtoLink(title, url, excerpt);
    expect(result).toContain(encodeURIComponent(url));
  });

  it('includes the excerpt in the body, URI-encoded', () => {
    const result = generateMailtoLink(title, url, excerpt);
    expect(result).toContain(encodeURIComponent(excerpt));
  });

  it('has body parameter containing both url and excerpt', () => {
    const result = generateMailtoLink(title, url, excerpt);
    const bodyMatch = result.match(/body=([^&]*)/);
    expect(bodyMatch).not.toBeNull();
    const bodyDecoded = decodeURIComponent(bodyMatch![1]);
    expect(bodyDecoded).toContain(url);
    expect(bodyDecoded).toContain(excerpt);
  });

  it('handles special characters in title', () => {
    const specialTitle = 'Hello & World <script>alert("xss")</script>';
    const result = generateMailtoLink(specialTitle, url, excerpt);
    expect(result).toContain(`subject=${encodeURIComponent(specialTitle)}`);
    // Should not contain unencoded angle brackets or ampersands in subject
    expect(result).not.toContain('subject=Hello & World');
  });

  it('handles URLs with query parameters', () => {
    const urlWithParams = 'https://example.com/docs?lang=en&page=1';
    const result = generateMailtoLink(title, urlWithParams, excerpt);
    expect(result).toContain(encodeURIComponent(urlWithParams));
  });

  it('handles unicode characters in title and excerpt', () => {
    const chineseTitle = '多语言文档知识库入门';
    const chineseExcerpt = '本指南介绍了多语言文档系统的基础知识。';
    const result = generateMailtoLink(chineseTitle, url, chineseExcerpt);
    expect(result).toContain(`subject=${encodeURIComponent(chineseTitle)}`);
    expect(result).toContain(encodeURIComponent(chineseExcerpt));
  });

  it('handles empty strings without throwing', () => {
    const result = generateMailtoLink('', '', '');
    expect(result.startsWith('mailto:?')).toBe(true);
    expect(result).toContain('subject=');
    expect(result).toContain('body=');
  });
});
