import { describe, it, expect } from 'vitest';
import { generateShareUrl, SharePlatform } from '@/components/features/ShareButtons';

describe('ShareButtons - generateShareUrl', () => {
  const title = 'Hello World';
  const url = 'https://example.com/docs/hello';
  const description = 'A test document';

  it('generates a valid Facebook share URL with encoded url and title', () => {
    const result = generateShareUrl('facebook', title, url, description);
    expect(result).toContain('https://www.facebook.com/sharer/sharer.php');
    expect(result).toContain(`u=${encodeURIComponent(url)}`);
    expect(result).toContain(`quote=${encodeURIComponent(title)}`);
  });

  it('generates a valid X (Twitter) share URL with encoded text and url', () => {
    const result = generateShareUrl('x', title, url, description);
    expect(result).toContain('https://x.com/intent/tweet');
    expect(result).toContain(`text=${encodeURIComponent(title)}`);
    expect(result).toContain(`url=${encodeURIComponent(url)}`);
  });

  it('generates a valid LinkedIn share URL with encoded url and title', () => {
    const result = generateShareUrl('linkedin', title, url, description);
    expect(result).toContain('https://www.linkedin.com/sharing/share-offsite/');
    expect(result).toContain(`url=${encodeURIComponent(url)}`);
    expect(result).toContain(`title=${encodeURIComponent(title)}`);
  });

  it('generates a WeChat QR code URL with encoded document url', () => {
    const result = generateShareUrl('wechat', title, url, description);
    expect(result).toContain('https://api.qrserver.com/v1/create-qr-code/');
    expect(result).toContain(`data=${encodeURIComponent(url)}`);
  });

  it('generates a mailto link with title as subject and url in body', () => {
    const result = generateShareUrl('email', title, url, description);
    expect(result.startsWith('mailto:')).toBe(true);
    expect(result).toContain(`subject=${encodeURIComponent(title)}`);
    expect(result).toContain(encodeURIComponent(url));
    expect(result).toContain(encodeURIComponent(description));
  });

  it('handles special characters in title and url', () => {
    const specialTitle = 'Hello & World <script>';
    const specialUrl = 'https://example.com/path?foo=bar&baz=1';

    const fbUrl = generateShareUrl('facebook', specialTitle, specialUrl, '');
    expect(fbUrl).toContain(encodeURIComponent(specialTitle));
    expect(fbUrl).toContain(encodeURIComponent(specialUrl));
  });

  it('handles empty strings gracefully', () => {
    const result = generateShareUrl('facebook', '', '', '');
    expect(result).toContain('https://www.facebook.com/sharer/sharer.php');
    // Should not throw
  });

  it('handles unicode characters in title', () => {
    const unicodeTitle = '多语言文档知识库';
    const result = generateShareUrl('x', unicodeTitle, url, description);
    expect(result).toContain(encodeURIComponent(unicodeTitle));
  });

  it('generates URLs for all supported platforms without throwing', () => {
    const platforms: SharePlatform[] = ['facebook', 'x', 'linkedin', 'wechat', 'email'];
    for (const platform of platforms) {
      expect(() => generateShareUrl(platform, title, url, description)).not.toThrow();
    }
  });
});
