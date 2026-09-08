import type { Project, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";

export function TaskList({
  status,
  tasks,
  projects,
  showProjectName = false,
}: {
  status: "loading" | "error" | "success";
  tasks: Task[];
  projects: Project[];
  showProjectName?: boolean;
}) {
  if (status === "loading") {
    return <p className="text-sm text-text-secondary">Loading tasks…</p>;
  }

  if (status === "error") {
    return <p className="text-sm text-status-blocked">Unable to load tasks.</p>;
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-text-secondary">No tasks match your filters.</p>;
  }

  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));

  return (
    <ul className="rounded border border-border-hairline bg-surface">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          projectName={showProjectName ? projectNameById.get(task.projectId) : undefined}
        />
      ))}
    </ul>
  );
}
