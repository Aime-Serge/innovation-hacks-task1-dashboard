import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-bold text-text-primary">Page not found</h1>
      <p className="text-sm text-text-secondary">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        href="/"
        className="rounded bg-interactive px-4 py-2 text-sm font-medium text-canvas"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
