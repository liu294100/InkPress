/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router handles i18n via [locale] dynamic segments
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: "zh",
    NEXT_PUBLIC_SUPPORTED_LOCALES: "zh,en,ja,ko,fr,de,es,ms,th",
  },
  // Image optimization config
  images: {
    unoptimized: true,
  },
  // Trailing slash for static hosting compatibility
  trailingSlash: false,
};

module.exports = nextConfig;
