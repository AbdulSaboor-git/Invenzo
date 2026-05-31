'use client';

/**
 * UI-03: Next.js App Router route-level error boundary for the (protected) group.
 *
 * This file is automatically used by Next.js 13+ when any page in the
 * (protected) segment throws during render.  It provides a user-friendly
 * fallback and a "Try again" button that calls reset() to re-render.
 */
export default function ProtectedError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center text-gray-600">
      <p className="text-2xl font-semibold mb-2">Something went wrong</p>
      <p className="text-sm mb-6 text-gray-400 max-w-md">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-sm"
      >
        Try again
      </button>
    </div>
  );
}
