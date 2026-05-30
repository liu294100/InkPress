import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC, Noto_Sans_JP, Noto_Sans_KR, Noto_Sans_Thai } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import '@/styles/globals.css';
import '@/styles/print.css';

/**
 * Primary font: Inter — professional sans-serif for Latin scripts.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * CJK fallback: Noto Sans SC for Simplified Chinese.
 */
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
});

/**
 * CJK fallback: Noto Sans JP for Japanese.
 */
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

/**
 * CJK fallback: Noto Sans KR for Korean.
 */
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

/**
 * Thai fallback: Noto Sans Thai.
 */
const notoSansThai = Noto_Sans_Thai({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-thai',
});

export const metadata: Metadata = {
  title: {
    template: '%s | WebDoc',
    default: 'WebDoc - Multilingual Documentation Knowledge Base',
  },
  description: 'A comprehensive multilingual documentation knowledge base supporting 9 languages with rich content rendering.',
  keywords: ['documentation', 'knowledge base', 'multilingual', 'markdown', 'webdoc'],
  metadataBase: new URL('https://webdoc.example.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansSC.variable} ${notoSansJP.variable} ${notoSansKR.variable} ${notoSansThai.variable}`}
    >
      <head>
        {/* Inline script to prevent FOUC (flash of unstyled content) on theme load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] antialiased font-sans transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
