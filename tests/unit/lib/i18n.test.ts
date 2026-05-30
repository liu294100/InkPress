import { describe, it, expect } from 'vitest';
import { detectLocale, isValidLocale, getLocalePath, getAlternateLocaleUrls } from '../../../src/lib/i18n';

describe('detectLocale', () => {
  it('should return exact match locale', () => {
    expect(detectLocale('en')).toBe('en');
    expect(detectLocale('zh')).toBe('zh');
    expect(detectLocale('ja')).toBe('ja');
  });

  it('should return prefix match for regional variants', () => {
    expect(detectLocale('en-US')).toBe('en');
    expect(detectLocale('zh-CN')).toBe('zh');
    expect(detectLocale('fr-FR')).toBe('fr');
    expect(detectLocale('de-AT')).toBe('de');
  });

  it('should return highest priority match from Accept-Language header', () => {
    expect(detectLocale('en-US,en;q=0.9,zh;q=0.8')).toBe('en');
    expect(detectLocale('zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh');
    expect(detectLocale('ja,en;q=0.9')).toBe('ja');
  });

  it('should handle quality values correctly', () => {
    // zh has higher q than en, so zh should be returned
    expect(detectLocale('en;q=0.7,zh;q=0.9')).toBe('zh');
    expect(detectLocale('fr;q=0.5,ko;q=0.8,en;q=0.3')).toBe('ko');
  });

  it('should default to "zh" when no supported locale matches', () => {
    expect(detectLocale('ru')).toBe('zh');
    expect(detectLocale('ar,he')).toBe('zh');
    expect(detectLocale('xx-YY')).toBe('zh');
  });

  it('should default to "zh" for empty or invalid input', () => {
    expect(detectLocale('')).toBe('zh');
    expect(detectLocale('   ')).toBe('zh');
  });

  it('should handle complex Accept-Language headers', () => {
    // Real-world browser header
    expect(detectLocale('en-US,en;q=0.9,fr;q=0.8,de;q=0.7')).toBe('en');
    // First supported match wins by priority
    expect(detectLocale('ru;q=1.0,en;q=0.9,zh;q=0.8')).toBe('en');
  });
});

describe('isValidLocale', () => {
  it('should return true for all supported locales', () => {
    const supported = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th'];
    for (const locale of supported) {
      expect(isValidLocale(locale)).toBe(true);
    }
  });

  it('should return false for unsupported locales', () => {
    expect(isValidLocale('ru')).toBe(false);
    expect(isValidLocale('ar')).toBe(false);
    expect(isValidLocale('en-US')).toBe(false);
    expect(isValidLocale('')).toBe(false);
    expect(isValidLocale('xx')).toBe(false);
  });
});

describe('getLocalePath', () => {
  it('should prefix path with locale', () => {
    expect(getLocalePath('en', '/docs/intro')).toBe('/en/docs/intro');
    expect(getLocalePath('zh', '/programming/patterns')).toBe('/zh/programming/patterns');
  });

  it('should handle root path', () => {
    expect(getLocalePath('en', '/')).toBe('/en');
    expect(getLocalePath('zh', '/')).toBe('/zh');
  });

  it('should handle path without leading slash', () => {
    expect(getLocalePath('en', 'docs/intro')).toBe('/en/docs/intro');
  });

  it('should handle empty path', () => {
    expect(getLocalePath('en', '')).toBe('/en');
  });
});

describe('getAlternateLocaleUrls', () => {
  it('should return URLs for all 9 supported locales', () => {
    const result = getAlternateLocaleUrls('/docs/intro');
    expect(result).toHaveLength(9);
  });

  it('should include correct locales', () => {
    const result = getAlternateLocaleUrls('/docs/intro');
    const locales = result.map((r) => r.locale);
    expect(locales).toEqual(['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th']);
  });

  it('should generate correct URLs', () => {
    const result = getAlternateLocaleUrls('/docs/intro');
    expect(result[0]).toEqual({ locale: 'zh', url: '/zh/docs/intro' });
    expect(result[1]).toEqual({ locale: 'en', url: '/en/docs/intro' });
    expect(result[2]).toEqual({ locale: 'ja', url: '/ja/docs/intro' });
  });

  it('should handle root path', () => {
    const result = getAlternateLocaleUrls('/');
    expect(result[0]).toEqual({ locale: 'zh', url: '/zh' });
    expect(result[1]).toEqual({ locale: 'en', url: '/en' });
  });
});
