"use client";

import { useState } from "react";
import { fetchProjects, fetchTasks } from "@/lib/mock-data";
import { useAsync } from "@/lib/useAsync";
import { StatsStrip } from "./StatsStrip";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { TaskList } from "@/components/tasks/TaskList";

export function DashboardView() {
  const [simulateError, setSimulateError] = useState(false);

  const projectsState = useAsync(() => fetchProjects({ simulateError }), [simulateError]);
  const tasksState = useAsync(() => fetchTasks(undefined, { simulateError }), [simulateError]);

  const projects = projectsState.data ?? [];
  const tasks = tasksState.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            An at-a-glance status check across your projects and tasks.
          </p>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <label className="flex items-center gap-2 rounded border border-border-hairline px-2.5 py-1.5 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
            />
            Simulate error (dev only)
          </label>
        )}
      </div>

      <section aria-label="Activity summary" className="mt-6">
        <StatsStrip
          status={projectsState.status}
          projects={projects}
          tasks={tasks}
          onRetry={projectsState.retry}
        />
      </section>

      <section aria-labelledby="projects-heading" className="mt-8">
        <h2 id="projects-heading" className="text-lg font-semibold text-text-primary">
          Projects
        </h2>
        <div className="mt-3">
          <ProjectGrid
            status={projectsState.status}
            projects={projects}
            tasks={tasks}
            onRetry={projectsState.retry}
          />
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
            onRetry={tasksState.retry}
          />
        </div>
      </section>
    </div>
  );
}
