import { formatDate, isOverdue, todayIso } from "@/lib/dates";
import { t } from "@/i18n";
import { TaskStatus, type Task } from "@/schemas";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { Icon } from "@/ui/Icon";
import { Select } from "@/ui/Input";
import { PriorityBadge } from "../shared/badges";

type TaskCardProps = {
  task: Task;
  projectName: string | undefined;
  assigneeName: string | undefined;
  onStatusChange: (status: TaskStatus) => void;
};

/** FR-12: every field, overdue marked visibly and announced to screen readers. */
export function TaskCard({ task, projectName, assigneeName, onStatusChange }: TaskCardProps) {
  const overdue = isOverdue(task, todayIso());
  return (
    <Card as="article" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate font-semibold" title={task.title}>
          {task.title}
        </h3>
        <PriorityBadge priority={task.priority} />
      </div>
      {projectName !== undefined && (
        <p className="flex items-center gap-1 text-sm text-muted">
          <Icon name="folder" />
          <span className="truncate" title={projectName}>
            {projectName}
          </span>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="flex items-center gap-1 text-muted">
          <Icon name="calendar" />
          {task.dueDate === null ? t("task.noDueDate") : formatDate(task.dueDate)}
        </span>
        {overdue && (
          <Badge tone="danger" icon="alert">
            {t("task.overdue")}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm">
        {assigneeName === undefined ? (
          <span className="text-muted">{t("task.unassigned")}</span>
        ) : (
          <>
            <Avatar name={assigneeName} size="sm" />
            <span className="truncate" title={assigneeName}>
              {assigneeName}
            </span>
          </>
        )}
      </div>
      <div>
        <label htmlFor={`status-${task.id}`} className="sr-only">
          {t("task.changeStatus", { title: task.title })}
        </label>
        <Select
          id={`status-${task.id}`}
          value={task.status}
          onChange={(event) => onStatusChange(TaskStatus.parse(event.target.value))}
        >
          {TaskStatus.options.map((status) => (
            <option key={status} value={status}>
              {t(`taskStatus.${status}`)}
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
}
