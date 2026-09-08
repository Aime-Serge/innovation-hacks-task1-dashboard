import type { Project, Task } from "@/lib/types";
import { getProjectProgress } from "@/lib/mock-data";
import { ProjectCard } from "./ProjectCard";

export function ProjectGrid({
  status,
  projects,
  tasks,
}: {
  status: "loading" | "error" | "success";
  projects: Project[];
  tasks: Task[];
}) {
  if (status === "loading") {
    return <p className="text-sm text-text-secondary">Loading projects…</p>;
  }

  if (status === "error") {
    return <p className="text-sm text-status-blocked">Unable to load projects.</p>;
  }

  if (projects.length === 0) {
    return <p className="text-sm text-text-secondary">No projects match your filters.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          progress={getProjectProgress(project.id, tasks)}
        />
      ))}
    </ul>
  );
}
