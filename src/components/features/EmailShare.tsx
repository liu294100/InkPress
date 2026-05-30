'use client';

/**
 * EmailShare component - opens the user's default email client with a pre-composed email.
 *
 * Features:
 * - Generates a mailto: URI with document title as subject
 * - Includes document URL and excerpt in the email body
 * - Properly URI-encodes all parameters
 * - Accessible from every document page
 * - Minimum 44x44px touch target for accessibility
 *
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4
 */

export interface EmailShareProps {
  /** Document title, used as the email subject */
  title: string;
  /** Full URL of the document page */
  url: string;
  /** Brief excerpt from the document content */
  excerpt: string;
}

/**
 * Generates a mailto: URI with the document title as the subject,
 * and the URL and excerpt in the body. All parameters are properly URI-encoded.
 *
 * Validates: Requirements 18.1, 18.2, 18.3
 */
export function generateMailtoLink(title: string, url: string, excerpt: string): string {
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(`${url}\n\n${excerpt}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

export function EmailShare({ title, url, excerpt }: EmailShareProps) {
  const mailtoLink = generateMailtoLink(title, url, excerpt);

  return (
    <a
      href={mailtoLink}
      className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg
                 bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-800
                 transition-colors duration-300 ease-in-out
                 text-secondary-700 dark:text-secondary-200
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      aria-label="Share via email"
      title="Share via email"
    >
      {/* Email/envelope icon */}
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </a>
  );
}
