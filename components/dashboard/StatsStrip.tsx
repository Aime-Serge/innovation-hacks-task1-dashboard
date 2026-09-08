import type { Project, Task } from "@/lib/types";

export function StatsStrip({
  status,
  projects,
  tasks,
}: {
  status: "loading" | "error" | "success";
  projects: Project[];
  tasks: Task[];
}) {
  if (status === "loading") {
    return <p className="text-sm text-text-secondary">Loading activity…</p>;
  }

  if (status === "error") {
    return <p className="text-sm text-status-blocked">Unable to load activity.</p>;
  }

  const stats = [
    { label: "Active projects", value: projects.length },
    { label: "Open tasks", value: tasks.filter((t) => t.status !== "done").length },
    { label: "In progress", value: tasks.filter((t) => t.status === "in-progress").length },
    { label: "Blocked", value: tasks.filter((t) => t.status === "blocked").length },
  ];

  if (tasks.length === 0 && projects.length === 0) {
    return <p className="text-sm text-text-secondary">No activity yet.</p>;
  }

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded border border-border-hairline bg-surface px-4 py-3"
        >
          <dt className="text-xs text-text-secondary">{stat.label}</dt>
          <dd className="mt-1 font-mono text-xl font-semibold text-text-primary">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
