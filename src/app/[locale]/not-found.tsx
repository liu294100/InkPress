import Link from 'next/link';

/**
 * Custom 404 page for locale-scoped routes.
 * Displayed when a document or category is not found within a valid locale.
 */
export default function LocaleNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* 404 visual */}
      <div className="mb-8">
        <svg
          className="w-24 h-24 mx-auto text-[rgb(var(--color-text-tertiary))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      </div>

      {/* Message */}
      <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
        Page Not Found
      </h1>
      <p className="text-[rgb(var(--color-text-secondary))] max-w-md mb-8">
        The document or page you requested could not be found. It may have been moved or doesn&apos;t exist yet.
      </p>

      {/* Action button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                   bg-[rgb(var(--color-accent))] text-white font-medium
                   hover:opacity-90 transition-opacity duration-200
                   min-h-[44px]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
        Go Back Home
      </Link>
    </div>
  );
}
