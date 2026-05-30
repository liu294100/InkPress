'use client';

import { useMemo } from 'react';
import { siteConfig } from '@/config/site.config';
import { getContentAccess, type ContentAccessResult } from '@/lib/paywall';
import type { Document } from '@/lib/types';

/**
 * PaywallGate component - wraps document content with paywall gating logic.
 *
 * When global paywall is disabled (default), renders children with full content.
 * When global paywall is enabled and document has paywallEnabled: true,
 * renders a preview with a paywall prompt overlay.
 *
 * Validates: Requirements 20.1, 20.2, 20.3, 20.4
 */
export interface PaywallGateProps {
  /** The document to check paywall access for */
  document: Document;
  /** Content to render when full access is granted */
  children: React.ReactNode;
  /** Optional: override global paywall enabled setting (useful for testing) */
  globalPaywallEnabled?: boolean;
  /** Preview content to display when paywalled (rendered Markdown/HTML preview) */
  previewContent?: React.ReactNode;
}

export default function PaywallGate({
  document,
  children,
  globalPaywallEnabled,
  previewContent,
}: PaywallGateProps) {
  const paywallEnabled = globalPaywallEnabled ?? siteConfig.features.paywall.enabled;

  const accessResult: ContentAccessResult = useMemo(
    () => getContentAccess(document, paywallEnabled),
    [document, paywallEnabled]
  );

  // Full access - render children as-is
  if (accessResult.fullAccess) {
    return <>{children}</>;
  }

  // Paywalled - show preview with paywall prompt
  return (
    <div className="relative">
      {/* Preview content with fade-out gradient */}
      <div className="relative overflow-hidden">
        {previewContent || (
          <div
            className="prose dark:prose-invert max-w-none"
            // Preview content as raw text fallback
          >
            <p className="text-[rgb(var(--color-text-secondary))] whitespace-pre-line">
              {accessResult.content}
            </p>
          </div>
        )}

        {/* Gradient fade overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32
                     bg-gradient-to-t from-[rgb(var(--color-bg-primary))] to-transparent
                     pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Paywall prompt */}
      <div
        className="mt-4 p-6 rounded-xl border border-[rgb(var(--color-border))]
                   bg-[rgb(var(--color-bg-secondary))]
                   text-center shadow-lg"
        role="alert"
        aria-label="Premium content paywall"
      >
        <LockIcon />
        <h3 className="mt-3 text-lg font-semibold text-[rgb(var(--color-text-primary))]">
          Premium Content
        </h3>
        <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))] max-w-md mx-auto">
          This article requires a subscription to access. Subscribe to unlock
          the full content.
        </p>
        <button
          className="mt-4 px-6 py-2.5 rounded-lg
                     bg-[rgb(var(--color-accent))] text-white
                     hover:opacity-90 transition-opacity duration-200
                     font-medium text-sm
                     min-w-[44px] min-h-[44px]"
          aria-label="Subscribe to unlock content"
          disabled
        >
          Coming Soon
        </button>
        <p className="mt-2 text-xs text-[rgb(var(--color-text-tertiary))]">
          Payment integration is coming in a future update.
        </p>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-[rgb(var(--color-accent))]"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
