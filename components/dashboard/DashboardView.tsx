"use client";

import { fetchProjects, fetchTasks } from "@/lib/mock-data";
import { useAsync } from "@/lib/useAsync";
import { StatsStrip } from "./StatsStrip";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { TaskList } from "@/components/tasks/TaskList";

export function DashboardView() {
  const projectsState = useAsync(() => fetchProjects(), []);
  const tasksState = useAsync(() => fetchTasks(), []);

  const projects = projectsState.data ?? [];
  const tasks = tasksState.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-text-secondary">
        An at-a-glance status check across your projects and tasks.
      </p>

      <section aria-label="Activity summary" className="mt-6">
        <StatsStrip status={projectsState.status} projects={projects} tasks={tasks} />
      </section>

      <section aria-labelledby="projects-heading" className="mt-8">
        <h2 id="projects-heading" className="text-lg font-semibold text-text-primary">
          Projects
        </h2>
        <div className="mt-3">
          <ProjectGrid status={projectsState.status} projects={projects} tasks={tasks} />
        </div>
      </section>

      <section aria-labelledby="tasks-heading" className="mt-8">
        <h2 id="tasks-heading" className="text-lg font-semibold text-text-primary">
          My tasks
        </h2>
        <div className="mt-3">
          <TaskList
            status={tasksState.status}
            tasks={tasks}
            projects={projects}
            showProjectName
          />
        </div>
      </section>
    </div>
  );
}
