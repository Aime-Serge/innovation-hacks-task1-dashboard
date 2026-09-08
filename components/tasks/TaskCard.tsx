import type { Task } from "@/lib/types";
import { formatDueDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/StatusBadge";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

const PRIORITY_DOT: Record<Task["priority"], string> = {
  high: "bg-status-blocked",
  medium: "bg-status-progress",
  low: "bg-text-secondary",
};

export function TaskCard({ task, projectName }: { task: Task; projectName?: string }) {
  return (
    <li className="flex flex-col gap-2 border-b border-border-hairline px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
        {projectName && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">{projectName}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <StatusBadge status={task.status} />
        <span className="inline-flex items-center gap-1.5 text-text-secondary">
          <span
            aria-hidden="true"
            className={`inline-block h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`}
          />
          {PRIORITY_LABEL[task.priority]}
        </span>
        <span className="font-mono text-text-secondary">{formatDueDate(task.dueDate)}</span>
      </div>
    </li>
  );
}
