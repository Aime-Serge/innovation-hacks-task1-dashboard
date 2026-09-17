"use client";

import { useEffect } from "react";

// Route-level error boundary: catches any uncaught render/render-phase
// error under this segment and shows a recoverable, on-brand screen
// instead of the framework's default error overlay. Required as its own
// file per Next.js's App Router convention — this isn't optional
// wiring, it's how error.tsx gets picked up at all.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real deployment this is where an error-tracking call (Sentry,
    // etc.) would go. No such service is wired up here, so this is the
    // one place a full stack trace goes to the browser console instead
    // of being silently dropped.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-bold text-text-primary">Something went wrong</h1>
      <p className="text-sm text-text-secondary">
        An unexpected error occurred while rendering this page. This has been logged.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-interactive px-4 py-2 text-sm font-medium text-canvas"
      >
        Try again
      </button>
    </div>
  );
}
