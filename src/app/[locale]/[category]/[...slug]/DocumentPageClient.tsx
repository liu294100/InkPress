'use client';

import { useRef, useState, useCallback } from 'react';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { HtmlRenderer } from '@/components/content/HtmlRenderer';
import TOCNav, { useActiveHeading } from '@/components/layout/TOCNav';
import ShareButtons from '@/components/features/ShareButtons';
import PdfExport from '@/components/features/PdfExport';
import { PrintButton } from '@/components/features/PrintButton';
import { EmailShare } from '@/components/features/EmailShare';
import ImmersiveMode from '@/components/features/ImmersiveMode';
import PaywallGate from '@/components/features/PaywallGate';
import AdSlot from '@/components/ads/AdSlot';
import type { Heading, Document } from '@/lib/types';

interface DocumentPageClientProps {
  document: Document;
  headings: Heading[];
  pageUrl: string;
  locale: string;
}

/**
 * Client-side document page component.
 * Handles all interactive features:
 * - TOC navigation with active heading tracking
 * - Immersive reading mode toggle
 * - Share buttons, PDF export, print, email share
 * - Ad slots at configured placements
 * - Paywall gating
 * - Content rendering (Markdown or HTML)
 */
export default function DocumentPageClient({
  document,
  headings: initialHeadings,
  pageUrl,
  locale,
}: DocumentPageClientProps) {
  const [headings, setHeadings] = useState<Heading[]>(initialHeadings);
  const [isImmersive, setIsImmersive] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeId = useActiveHeading(headings);

  const handleHeadingsExtracted = useCallback((extracted: Heading[]) => {
    setHeadings(extracted);
  }, []);

  const handleTOCItemClick = useCallback((id: string) => {
    const element = globalThis.document?.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const toggleImmersive = useCallback(() => {
    setIsImmersive((prev) => !prev);
  }, []);

  const excerpt = document.frontmatter.description || document.content.slice(0, 200);

  const contentElement = (
    <div ref={contentRef}>
      {document.contentType === 'markdown' ? (
        <MarkdownRenderer
          content={document.content}
          onHeadingsExtracted={handleHeadingsExtracted}
        />
      ) : (
        <HtmlRenderer html={document.content} />
      )}
    </div>
  );

  return (
    <ImmersiveMode isActive={isImmersive} onToggle={toggleImmersive}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Ad Slot */}
        <AdSlot placement="header" />

        <div className="flex gap-8">
          {/* Main Content Area */}
          <article className="flex-1 min-w-0">
            {/* Document Title */}
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] leading-tight">
                {document.frontmatter.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[rgb(var(--color-text-tertiary))]">
                {document.frontmatter.author && (
                  <span>{document.frontmatter.author}</span>
                )}
                {document.frontmatter.date && (
                  <time dateTime={document.frontmatter.date}>{document.frontmatter.date}</time>
                )}
                <span>{document.readingTime} min read</span>
              </div>
            </header>

            {/* Action Bar: Share, PDF, Print, Email, Immersive Toggle */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-[rgb(var(--color-border))]">
              <ShareButtons
                title={document.frontmatter.title}
                url={pageUrl}
                description={excerpt}
                platforms={['facebook', 'x', 'linkedin', 'wechat', 'email']}
              />
              <div className="flex items-center gap-2 ml-auto">
                <PdfExport
                  contentRef={contentRef as React.RefObject<HTMLElement>}
                  title={document.frontmatter.title}
                  fileName={`${document.slug.replace(/\//g, '-')}.pdf`}
                />
                <PrintButton />
                <EmailShare
                  title={document.frontmatter.title}
                  url={pageUrl}
                  excerpt={excerpt}
                />
                <button
                  onClick={toggleImmersive}
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg
                             bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-800
                             text-secondary-700 dark:text-secondary-200
                             transition-colors duration-300 ease-in-out
                             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                  aria-label="Enter immersive reading mode"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Ad Slot (before content) */}
            <AdSlot placement="content" />

            {/* Document Content with Paywall Gate */}
            <PaywallGate document={document}>
              {contentElement}
            </PaywallGate>
          </article>

          {/* Sidebar: TOC + Ad — hidden on mobile/tablet, shown on desktop (>1024px) */}
          <aside className="hidden lg:block w-64 flex-shrink-0" aria-label="Table of contents sidebar">
            <div className="sticky top-20 space-y-6">
              <TOCNav
                headings={headings}
                activeId={activeId}
                onItemClick={handleTOCItemClick}
              />
              <AdSlot placement="sidebar" />
            </div>
          </aside>
        </div>

        {/* Footer Ad Slot */}
        <AdSlot placement="footer" />
      </div>
    </ImmersiveMode>
  );
}
