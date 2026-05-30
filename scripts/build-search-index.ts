/**
 * Build script to generate search indices for all supported locales.
 * Runs during `next build` to produce per-locale JSON index files
 * in public/search-index/ for client-side FlexSearch loading.
 */

import { buildAllSearchIndices } from '../src/lib/search';
import { siteConfig } from '../src/config/site.config';

async function main() {
  const locales = siteConfig.supportedLocales;
  console.log(`[search-index] Building search indices for ${locales.length} locales: ${locales.join(', ')}`);

  const startTime = Date.now();

  try {
    await buildAllSearchIndices(locales);
    const elapsed = Date.now() - startTime;
    console.log(`[search-index] Successfully generated indices for all ${locales.length} locales in ${elapsed}ms`);
  } catch (error) {
    console.error('[search-index] Failed to build search indices:', error);
    process.exit(1);
  }
}

main();
