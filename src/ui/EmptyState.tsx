import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type EmptyStateProps = { icon?: IconName; title: string; body?: string; action?: ReactNode };

export function EmptyState({ icon = "inbox", title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line px-4 py-10 text-center">
      <Icon name={icon} className="size-8 text-muted" />
      <h3 className="text-base font-semibold">{title}</h3>
      {body !== undefined && <p className="max-w-md text-sm text-muted">{body}</p>}
      {action}
    </div>
  );
}
