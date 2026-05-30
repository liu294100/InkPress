import { describe, it, expect } from 'vitest';
import { siteConfig } from '../../../src/config/site.config';
import { categoriesConfig } from '../../../src/config/categories.config';
import { adsConfig } from '../../../src/config/ads.config';

describe('Site configuration', () => {
  it('should have "zh" as defaultLocale', () => {
    expect(siteConfig.defaultLocale).toBe('zh');
  });

  it('should support all 9 locales', () => {
    const expectedLocales = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th'];
    expect(siteConfig.supportedLocales).toEqual(expectedLocales);
    expect(siteConfig.supportedLocales).toHaveLength(9);
  });

  it('should have all features disabled by default', () => {
    expect(siteConfig.features.paywall.enabled).toBe(false);
    expect(siteConfig.features.ads.enabled).toBe(false);
    expect(siteConfig.features.analytics.enabled).toBe(false);
  });

  it('should have site name and url configured', () => {
    expect(siteConfig.name).toBeTruthy();
    expect(siteConfig.url).toBeTruthy();
  });

  it('should have footer configuration', () => {
    expect(siteConfig.footer.privacyPolicyUrl).toBeTruthy();
    expect(siteConfig.footer.copyrightHolder).toBeTruthy();
  });

  it('should have social media fields defined', () => {
    expect(siteConfig.social).toHaveProperty('facebook');
    expect(siteConfig.social).toHaveProperty('youtube');
    expect(siteConfig.social).toHaveProperty('x');
    expect(siteConfig.social).toHaveProperty('instagram');
    expect(siteConfig.social).toHaveProperty('threads');
    expect(siteConfig.social).toHaveProperty('wechat');
  });
});

describe('Categories configuration', () => {
  it('should have 5 default categories', () => {
    expect(categoriesConfig.categories).toHaveLength(5);
  });

  it('should include all required category IDs', () => {
    const ids = categoriesConfig.categories.map((c) => c.id);
    expect(ids).toContain('programming');
    expect(ids).toContain('ai');
    expect(ids).toContain('finance');
    expect(ids).toContain('articles');
    expect(ids).toContain('history');
  });

  it('should have localized names for all 9 languages in each category', () => {
    const supportedLocales = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ms', 'th'];
    for (const category of categoriesConfig.categories) {
      for (const locale of supportedLocales) {
        expect(category.name[locale]).toBeTruthy();
      }
    }
  });

  it('should have correct Chinese names', () => {
    const programming = categoriesConfig.categories.find((c) => c.id === 'programming');
    const ai = categoriesConfig.categories.find((c) => c.id === 'ai');
    const finance = categoriesConfig.categories.find((c) => c.id === 'finance');
    const articles = categoriesConfig.categories.find((c) => c.id === 'articles');
    const history = categoriesConfig.categories.find((c) => c.id === 'history');

    expect(programming?.name.zh).toBe('编程');
    expect(ai?.name.zh).toBe('AI');
    expect(finance?.name.zh).toBe('投资理财');
    expect(articles?.name.zh).toBe('文章');
    expect(history?.name.zh).toBe('历史');
  });

  it('should have ordered categories from 1 to 5', () => {
    const orders = categoriesConfig.categories.map((c) => c.order);
    expect(orders).toEqual([1, 2, 3, 4, 5]);
  });

  it('should have icon and color for each category', () => {
    for (const category of categoriesConfig.categories) {
      expect(category.icon).toBeTruthy();
      expect(category.color).toBeTruthy();
    }
  });
});

describe('Ads configuration', () => {
  it('should have ads disabled by default', () => {
    expect(adsConfig.enabled).toBe(false);
  });

  it('should have an empty adsenseId by default', () => {
    expect(adsConfig.adsenseId).toBe('');
  });

  it('should have all placements disabled by default', () => {
    expect(adsConfig.placements.header).toBe(false);
    expect(adsConfig.placements.sidebar).toBe(false);
    expect(adsConfig.placements.content).toBe(false);
    expect(adsConfig.placements.footer).toBe(false);
  });

  it('should have all 4 placement positions defined', () => {
    expect(adsConfig.placements).toHaveProperty('header');
    expect(adsConfig.placements).toHaveProperty('sidebar');
    expect(adsConfig.placements).toHaveProperty('content');
    expect(adsConfig.placements).toHaveProperty('footer');
  });
});
