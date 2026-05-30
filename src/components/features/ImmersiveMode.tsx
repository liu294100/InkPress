'use client';

import { useEffect, useCallback } from 'react';

/**
 * ImmersiveMode component - provides a distraction-free reading experience.
 *
 * When active, renders children in a fullscreen overlay with:
 * - TOC sidebar, header, footer, and ads hidden (fullscreen overlay covers them)
 * - Optimized typography: larger font, comfortable line spacing, centered narrow width
 * - Visible exit button to return to normal view
 * - Escape key support to exit immersive mode
 *
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4
 */
export interface ImmersiveModeProps {
  children: React.ReactNode;
  isActive: boolean;
  onToggle: () => void;
}

export default function ImmersiveMode({ children, isActive, onToggle }: ImmersiveModeProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive) {
        onToggle();
      }
    },
    [isActive, onToggle]
  );

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling when immersive mode is active
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isActive, handleKeyDown]);

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-[rgb(var(--color-bg-primary))] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Immersive reading mode"
    >
      {/* Exit Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-[101] flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))]
                   text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]
                   hover:bg-[rgb(var(--color-bg-tertiary))]
                   transition-all duration-200 ease-in-out
                   shadow-md hover:shadow-lg
                   min-w-[44px] min-h-[44px]"
        aria-label="Exit immersive reading mode"
      >
        <ExitIcon />
        <span className="text-sm font-medium hidden sm:inline">Exit</span>
      </button>

      {/* Immersive Content Area */}
      <div
        className="mx-auto max-w-[65ch] px-6 py-16 sm:px-8 md:py-20
                   text-lg leading-relaxed sm:text-xl sm:leading-relaxed
                   text-[rgb(var(--color-text-primary))]
                   [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:leading-tight
                   [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-tight
                   [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
                   [&_p]:mb-6 [&_p]:leading-[1.8]
                   [&_ul]:mb-6 [&_ul]:pl-6 [&_ul]:list-disc
                   [&_ol]:mb-6 [&_ol]:pl-6 [&_ol]:list-decimal
                   [&_li]:mb-2 [&_li]:leading-[1.8]
                   [&_blockquote]:border-l-4 [&_blockquote]:border-[rgb(var(--color-accent))] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6
                   [&_code]:text-base [&_code]:bg-[rgb(var(--color-bg-secondary))] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
                   [&_pre]:my-6 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:bg-[rgb(var(--color-bg-secondary))]
                   [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-6
                   [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse
                   [&_th]:border [&_th]:border-[rgb(var(--color-border))] [&_th]:px-4 [&_th]:py-2 [&_th]:bg-[rgb(var(--color-bg-secondary))]
                   [&_td]:border [&_td]:border-[rgb(var(--color-border))] [&_td]:px-4 [&_td]:py-2"
      >
        {children}
      </div>
    </div>
  );
}

function ExitIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
