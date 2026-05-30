'use client';

import Script from 'next/script';
import { adsConfig, type AdsConfig } from '@/config/ads.config';

export interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'content' | 'footer';
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

/**
 * Checks whether ads are enabled for a given placement.
 * Returns true only if ads are globally enabled AND the specific placement is enabled.
 */
export function isAdEnabled(
  placement: AdSlotProps['placement'],
  config: AdsConfig = adsConfig
): boolean {
  if (!config.enabled) {
    return false;
  }
  return config.placements[placement] === true;
}

/** Track whether the AdSense script has been requested */
let adsenseScriptInjected = false;

/**
 * AdSlot component renders a Google AdSense ad unit at the specified placement.
 *
 * - Renders nothing when ads are globally disabled in configuration.
 * - Renders nothing when the specific placement is disabled.
 * - Injects the AdSense script only once via next/script.
 * - Gracefully degrades if the script fails to load.
 */
export default function AdSlot({ placement, format = 'auto' }: AdSlotProps) {
  if (!isAdEnabled(placement)) {
    return null;
  }

  const shouldInjectScript = !adsenseScriptInjected;
  if (shouldInjectScript) {
    adsenseScriptInjected = true;
  }

  const formatStyles: Record<string, React.CSSProperties> = {
    auto: { display: 'block' },
    rectangle: { display: 'inline-block', width: 300, height: 250 },
    horizontal: { display: 'inline-block', width: 728, height: 90 },
    vertical: { display: 'inline-block', width: 160, height: 600 },
  };

  return (
    <div
      className={`ad-slot ad-slot--${placement}`}
      data-ad-placement={placement}
      data-ad-format={format}
    >
      {shouldInjectScript && (
        <Script
          id="adsense-script"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.adsenseId}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
          onError={() => {
            // Graceful degradation: if the script fails to load,
            // the ad slot simply remains empty. No crash.
            console.warn('[AdSlot] AdSense script failed to load.');
          }}
        />
      )}
      <ins
        className="adsbygoogle"
        style={formatStyles[format] || formatStyles.auto}
        data-ad-client={adsConfig.adsenseId}
        data-ad-slot={placement}
        data-ad-format={format === 'auto' ? 'auto' : undefined}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  );
}
