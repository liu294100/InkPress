import { describe, it, expect, vi } from 'vitest';

// Mock next/script to avoid loading Next.js internals in tests
vi.mock('next/script', () => ({
  default: () => null,
}));

import { isAdEnabled } from '@/components/ads/AdSlot';
import type { AdsConfig } from '@/config/ads.config';

describe('AdSlot - isAdEnabled', () => {
  it('returns false when ads are globally disabled', () => {
    const config: AdsConfig = {
      enabled: false,
      adsenseId: 'ca-pub-123',
      placements: {
        header: true,
        sidebar: true,
        content: true,
        footer: true,
      },
    };
    expect(isAdEnabled('header', config)).toBe(false);
    expect(isAdEnabled('sidebar', config)).toBe(false);
    expect(isAdEnabled('content', config)).toBe(false);
    expect(isAdEnabled('footer', config)).toBe(false);
  });

  it('returns false when ads are enabled but placement is disabled', () => {
    const config: AdsConfig = {
      enabled: true,
      adsenseId: 'ca-pub-123',
      placements: {
        header: false,
        sidebar: false,
        content: false,
        footer: false,
      },
    };
    expect(isAdEnabled('header', config)).toBe(false);
    expect(isAdEnabled('sidebar', config)).toBe(false);
    expect(isAdEnabled('content', config)).toBe(false);
    expect(isAdEnabled('footer', config)).toBe(false);
  });

  it('returns true when ads are enabled and placement is enabled', () => {
    const config: AdsConfig = {
      enabled: true,
      adsenseId: 'ca-pub-123',
      placements: {
        header: true,
        sidebar: true,
        content: true,
        footer: true,
      },
    };
    expect(isAdEnabled('header', config)).toBe(true);
    expect(isAdEnabled('sidebar', config)).toBe(true);
    expect(isAdEnabled('content', config)).toBe(true);
    expect(isAdEnabled('footer', config)).toBe(true);
  });

  it('returns true only for enabled placements in a mixed config', () => {
    const config: AdsConfig = {
      enabled: true,
      adsenseId: 'ca-pub-123',
      placements: {
        header: true,
        sidebar: false,
        content: true,
        footer: false,
      },
    };
    expect(isAdEnabled('header', config)).toBe(true);
    expect(isAdEnabled('sidebar', config)).toBe(false);
    expect(isAdEnabled('content', config)).toBe(true);
    expect(isAdEnabled('footer', config)).toBe(false);
  });

  it('returns false with default adsConfig (all disabled)', () => {
    // Uses the default imported config from ads.config.ts
    // which has enabled: false
    expect(isAdEnabled('header')).toBe(false);
    expect(isAdEnabled('sidebar')).toBe(false);
    expect(isAdEnabled('content')).toBe(false);
    expect(isAdEnabled('footer')).toBe(false);
  });
});
