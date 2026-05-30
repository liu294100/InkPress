/**
 * Property 20: Ad placement follows configuration
 * Validates: Requirements 11.2
 *
 * "For any ads configuration specifying which placements are enabled (header, sidebar, content, footer),
 * the ad system SHALL render ad slots only in the enabled positions and SHALL NOT render ad slots
 * in disabled positions."
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';

// Mock next/script to avoid @swc/helpers dependency
vi.mock('next/script', () => ({ default: () => null }));

import { isAdEnabled } from '@/components/ads/AdSlot';
import type { AdsConfig } from '@/config/ads.config';

/**
 * All valid ad placement positions.
 */
const placements = ['header', 'sidebar', 'content', 'footer'] as const;
type Placement = (typeof placements)[number];

/**
 * Arbitrary for generating a single ad placement.
 */
const placementArb = fc.constantFrom<Placement>(...placements);

/**
 * Arbitrary for generating an AdsConfig object with randomized placement settings.
 */
const adsConfigArb = fc.record({
  enabled: fc.boolean(),
  adsenseId: fc.stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
    { minLength: 0, maxLength: 30 }
  ),
  placements: fc.record({
    header: fc.boolean(),
    sidebar: fc.boolean(),
    content: fc.boolean(),
    footer: fc.boolean(),
  }),
});

describe('Feature: multilingual-docs-site, Property 20: Ad placement follows configuration', () => {
  it('enabled placements return true when ads are globally enabled', () => {
    /**
     * **Validates: Requirements 11.2**
     *
     * For any configuration where ads are globally enabled, isAdEnabled SHALL return true
     * for placements that are individually enabled in the placements config.
     */
    fc.assert(
      fc.property(placementArb, adsConfigArb, (placement, config) => {
        // Force ads globally enabled and this placement enabled
        const enabledConfig: AdsConfig = {
          ...config,
          enabled: true,
          placements: {
            ...config.placements,
            [placement]: true,
          },
        };

        const result = isAdEnabled(placement, enabledConfig);
        expect(result).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('disabled placements return false when ads are globally enabled', () => {
    /**
     * **Validates: Requirements 11.2**
     *
     * For any configuration where ads are globally enabled, isAdEnabled SHALL return false
     * for placements that are individually disabled in the placements config.
     */
    fc.assert(
      fc.property(placementArb, adsConfigArb, (placement, config) => {
        // Force ads globally enabled but this placement disabled
        const disabledConfig: AdsConfig = {
          ...config,
          enabled: true,
          placements: {
            ...config.placements,
            [placement]: false,
          },
        };

        const result = isAdEnabled(placement, disabledConfig);
        expect(result).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('all placements return false when ads are globally disabled', () => {
    /**
     * **Validates: Requirements 11.2**
     *
     * For any configuration where ads are globally disabled, isAdEnabled SHALL return false
     * for ALL placements regardless of their individual settings.
     */
    fc.assert(
      fc.property(placementArb, adsConfigArb, (placement, config) => {
        // Force ads globally disabled (individual placement settings don't matter)
        const globallyDisabledConfig: AdsConfig = {
          ...config,
          enabled: false,
        };

        const result = isAdEnabled(placement, globallyDisabledConfig);
        expect(result).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('isAdEnabled result matches the conjunction of global enabled AND placement enabled', () => {
    /**
     * **Validates: Requirements 11.2**
     *
     * For any ads configuration and any placement, isAdEnabled SHALL return true
     * if and only if both the global enabled flag is true AND the specific placement
     * flag is true.
     */
    fc.assert(
      fc.property(placementArb, adsConfigArb, (placement, config) => {
        const result = isAdEnabled(placement, config);
        const expected = config.enabled && config.placements[placement];

        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('only enabled placements are active in a mixed configuration', () => {
    /**
     * **Validates: Requirements 11.2**
     *
     * For any ads configuration with ads globally enabled, the set of placements
     * for which isAdEnabled returns true SHALL be exactly the set of placements
     * that are enabled in the configuration.
     */
    fc.assert(
      fc.property(adsConfigArb, (config) => {
        const enabledConfig: AdsConfig = { ...config, enabled: true };

        const enabledPlacements = placements.filter((p) => isAdEnabled(p, enabledConfig));
        const expectedPlacements = placements.filter((p) => enabledConfig.placements[p]);

        expect(enabledPlacements).toEqual(expectedPlacements);
      }),
      { numRuns: 100 }
    );
  });
});
