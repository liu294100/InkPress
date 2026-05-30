'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Heading } from '@/lib/types';

export interface TOCNavProps {
  headings: Heading[];
  activeId: string;
  onItemClick: (id: string) => void;
}

export default function TOCNav({ headings, activeId, onItemClick }: TOCNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  // Scroll the active item into view within the TOC panel
  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeItemRef.current.getBoundingClientRect();

      if (itemRect.top < navRect.top || itemRect.bottom > navRect.bottom) {
        activeItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [activeId]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      onItemClick(id);

      // Smooth scroll to the heading element
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [onItemClick]
  );

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      className="hidden lg:block sticky top-20 w-[var(--toc-width)] max-h-[calc(100vh-5rem)] overflow-y-auto pr-2"
      aria-label="Table of contents"
    >
      <div className="glass-card p-4 rounded-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))] mb-3">
          On this page
        </h3>
        <ul className="space-y-0.5">
          {renderHeadings(headings, activeId, handleClick, activeItemRef)}
        </ul>
      </div>
    </nav>
  );
}

/**
 * Recursively renders the heading tree with indentation based on level.
 */
function renderHeadings(
  headings: Heading[],
  activeId: string,
  handleClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void,
  activeItemRef: React.MutableRefObject<HTMLAnchorElement | null>
): React.ReactNode {
  return headings.map((heading) => {
    const isActive = activeId === heading.id;
    // Indentation based on heading level (h2 = 0, h3 = 1, h4 = 2, etc.)
    const indent = Math.max(0, heading.level - 2);

    return (
      <li key={heading.id}>
        <a
          ref={isActive ? (el) => { activeItemRef.current = el; } : undefined}
          href={`#${heading.id}`}
          onClick={(e) => handleClick(e, heading.id)}
          className={`
            block py-1.5 text-xs leading-relaxed rounded-md px-2
            transition-all duration-200 ease-in-out
            ${isActive
              ? 'text-[rgb(var(--color-accent))] font-medium bg-[rgb(var(--color-accent))/0.08] border-l-2 border-[rgb(var(--color-accent))]'
              : 'text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] border-l-2 border-transparent'
            }
          `}
          style={{ marginLeft: `${indent * 0.75}rem` }}
          aria-current={isActive ? 'location' : undefined}
        >
          <span className="line-clamp-2">{heading.text}</span>
        </a>

        {/* Render children recursively */}
        {heading.children && heading.children.length > 0 && (
          <ul className="space-y-0.5">
            {renderHeadings(heading.children, activeId, handleClick, activeItemRef)}
          </ul>
        )}
      </li>
    );
  });
}

/**
 * Custom hook for tracking the active heading via IntersectionObserver.
 * Use this in the parent page component and pass activeId down to TOCNav.
 *
 * Usage:
 *   const activeId = useActiveHeading(headings);
 *   <TOCNav headings={headings} activeId={activeId} onItemClick={setActiveId} />
 */
export function useActiveHeading(headings: Heading[]): string {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Flatten heading tree to get all IDs
    const allIds = flattenHeadingIds(headings);
    if (allIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length > 0) {
          // Use the topmost visible heading
          const topmost = visibleEntries.reduce((prev, curr) => {
            return prev.boundingClientRect.top < curr.boundingClientRect.top
              ? prev
              : curr;
          });
          setActiveId(topmost.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    // Observe all heading elements
    allIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

/**
 * Flattens a heading tree into a simple array of IDs (depth-first).
 */
function flattenHeadingIds(headings: Heading[]): string[] {
  const ids: string[] = [];
  for (const heading of headings) {
    ids.push(heading.id);
    if (heading.children && heading.children.length > 0) {
      ids.push(...flattenHeadingIds(heading.children));
    }
  }
  return ids;
}
