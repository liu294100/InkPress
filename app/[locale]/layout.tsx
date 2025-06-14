import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InkPress - Modern Markdown Blog',
  description: 'A modern, fast, and local-first markdown-powered blog system built with Next.js App Router.',
  keywords: ['blog', 'markdown', 'nextjs', 'typescript', 'tailwindcss'],
  authors: [{ name: 'InkPress' }],
  creator: 'InkPress',
  publisher: 'InkPress',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://inkpress.vercel.app'),
  openGraph: {
    title: 'InkPress - Modern Markdown Blog',
    description: 'A modern, fast, and local-first markdown-powered blog system built with Next.js App Router.',
    url: 'https://inkpress.vercel.app',
    siteName: 'InkPress',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InkPress - Modern Markdown Blog',
    description: 'A modern, fast, and local-first markdown-powered blog system built with Next.js App Router.',
    creator: '@inkpress',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}