"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncStatus = "loading" | "error" | "success";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  retry: () => void;
}

/**
 * Wraps an async fetcher in loading/error/success state and a retry
 * handle. Every data-bound component in the dashboard (ProjectGrid,
 * TaskList, StatsStrip, ProfileMenu) is built on this contract so the
 * loading/empty/error/success branches stay consistent app-wide.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...deps]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { status, data, error, retry };
}
