import Link from "next/link";
import type { Project, ProjectProgress } from "@/lib/types";

export function ProjectCard({
  project,
  progress,
}: {
  project: Project;
  progress: ProjectProgress;
}) {
  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="block rounded border border-border-hairline bg-surface p-4 transition-colors hover:border-interactive focus-visible:border-interactive"
      >
        <h3 className="truncate text-sm font-semibold text-text-primary">{project.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{project.description}</p>
        <p className="mt-3 font-mono text-xs text-text-secondary">
          {progress.done}/{progress.total} tasks done
        </p>
      </Link>
    </li>
  );
}
