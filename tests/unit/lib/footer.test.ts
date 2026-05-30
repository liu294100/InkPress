import { describe, it, expect } from 'vitest';
import { generateCopyrightNotice, renderSocialLink, buildSocialLinks } from '../../../src/lib/footer';
import type { SocialLink } from '../../../src/lib/types';

describe('generateCopyrightNotice', () => {
  it('should generate copyright in the exact format', () => {
    const result = generateCopyrightNotice(2024, 'WebDoc');
    expect(result).toBe('© 2024 WebDoc. All rights reserved.');
  });

  it('should use the provided year', () => {
    const result = generateCopyrightNotice(2025, 'TestSite');
    expect(result).toBe('© 2025 TestSite. All rights reserved.');
  });

  it('should handle single character name', () => {
    const result = generateCopyrightNotice(2024, 'X');
    expect(result).toBe('© 2024 X. All rights reserved.');
  });
});

describe('renderSocialLink', () => {
  it('should return hasLink: true with href when URL is provided', () => {
    const link: SocialLink = {
      platform: 'facebook',
      url: 'https://facebook.com/webdoc',
      icon: 'path-data',
    };
    const result = renderSocialLink(link);
    expect(result).toEqual({ hasLink: true, href: 'https://facebook.com/webdoc' });
  });

  it('should return hasLink: false when URL is undefined', () => {
    const link: SocialLink = {
      platform: 'youtube',
      icon: 'path-data',
    };
    const result = renderSocialLink(link);
    expect(result).toEqual({ hasLink: false });
  });

  it('should return hasLink: false when URL is empty string', () => {
    const link: SocialLink = {
      platform: 'x',
      url: '',
      icon: 'path-data',
    };
    const result = renderSocialLink(link);
    expect(result).toEqual({ hasLink: false });
  });

  it('should return hasLink: false when URL is whitespace only', () => {
    const link: SocialLink = {
      platform: 'instagram',
      url: '   ',
      icon: 'path-data',
    };
    const result = renderSocialLink(link);
    expect(result).toEqual({ hasLink: false });
  });

  it('should work for all platforms with valid URLs', () => {
    const platforms: SocialLink['platform'][] = ['facebook', 'youtube', 'x', 'instagram', 'threads', 'wechat'];
    for (const platform of platforms) {
      const link: SocialLink = {
        platform,
        url: `https://example.com/${platform}`,
        icon: 'path-data',
      };
      const result = renderSocialLink(link);
      expect(result.hasLink).toBe(true);
      expect(result.href).toBe(`https://example.com/${platform}`);
    }
  });
});

describe('buildSocialLinks', () => {
  it('should return all 6 platforms', () => {
    const social = {
      facebook: '',
      youtube: '',
      x: '',
      instagram: '',
      threads: '',
      wechat: '',
    };
    const links = buildSocialLinks(social);
    expect(links).toHaveLength(6);
    expect(links.map(l => l.platform)).toEqual(['facebook', 'youtube', 'x', 'instagram', 'threads', 'wechat']);
  });

  it('should include URL only when provided', () => {
    const social = {
      facebook: 'https://facebook.com/test',
      youtube: '',
      x: undefined,
      instagram: 'https://instagram.com/test',
      threads: '',
      wechat: undefined,
    };
    const links = buildSocialLinks(social);
    expect(links[0].url).toBe('https://facebook.com/test');
    expect(links[1].url).toBeUndefined();
    expect(links[2].url).toBeUndefined();
    expect(links[3].url).toBe('https://instagram.com/test');
    expect(links[4].url).toBeUndefined();
    expect(links[5].url).toBeUndefined();
  });

  it('should include icon path data for each platform', () => {
    const social = {};
    const links = buildSocialLinks(social);
    for (const link of links) {
      expect(link.icon).toBeTruthy();
      expect(typeof link.icon).toBe('string');
    }
  });
});
