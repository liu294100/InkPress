import Link from 'next/link';

/**
 * Custom 404 page displayed when a route is not found.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* 404 visual */}
      <div className="mb-8">
        <h1 className="text-8xl sm:text-9xl font-bold text-[rgb(var(--color-text-tertiary))] select-none">
          404
        </h1>
      </div>

      {/* Message */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">
        Page Not Found
      </h2>
      <p className="text-[rgb(var(--color-text-secondary))] max-w-md mb-8">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Navigation links */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/zh"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                     bg-[rgb(var(--color-accent))] text-white font-medium
                     hover:opacity-90 transition-opacity duration-200
                     min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
