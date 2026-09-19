import type { ReactNode } from "react";
import { t } from "@/i18n";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export type RegionStatus = "loading" | "error" | "success";

type RegionStateProps<T> = {
  /** Query state: loading, error or success. */
  status: RegionStatus;
  data: readonly T[] | undefined;
  /** True when a search or filter is active, so an empty result is "no results". */
  filtered: boolean;
  skeleton: ReactNode;
  empty: { title: string; body?: string; action?: ReactNode };
  onRetry: () => void;
  onClearFilters?: () => void;
  children: (items: readonly T[]) => ReactNode;
};

/**
 * NFR-05: every dynamic region renders exactly one of the five states:
 * loading, success, empty (no data exists), no-results (filters hide it) or
 * error with Retry.
 */
export function RegionState<T>(props: RegionStateProps<T>) {
  const { status, data, filtered, skeleton, empty, onRetry, onClearFilters, children } = props;
  if (status === "loading") {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">{t("common.loading")}</span>
        {skeleton}
      </div>
    );
  }
  if (status === "error" || data === undefined) return <ErrorState onRetry={onRetry} />;
  if (data.length === 0) {
    if (filtered) {
      return (
        <EmptyState
          icon="search"
          title={t("state.noResults.title")}
          body={t("state.noResults.body")}
          action={
            onClearFilters !== undefined && (
              <Button onClick={onClearFilters}>{t("common.clearFilters")}</Button>
            )
          }
        />
      );
    }
    return <EmptyState {...empty} />;
  }
  return <>{children(data)}</>;
}
