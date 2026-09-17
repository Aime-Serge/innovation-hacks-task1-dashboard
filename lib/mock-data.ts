import type { Priority, Project, ProjectProgress, Task, TaskStatus, User } from "./types";

// This module simulates the REST API that Task 2 will provide.
// fetchProjects()/fetchTasks() intentionally mirror the shape and async
// contract of a real network call (latency + rejectable promise) so that
// swapping them for `fetch("/api/projects")` etc. later is a drop-in
// replacement, not a rewrite of any consuming component.

const projects: Project[] = [
  {
    id: "proj-atlas",
    name: "Atlas API Gateway",
    description: "Rate-limited gateway routing traffic to internal services.",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "proj-beacon",
    name: "Beacon Notifications",
    description: "Push/email/SMS delivery pipeline with retry handling.",
    createdAt: "2026-07-14T09:00:00.000Z",
  },
  {
    id: "proj-cairn",
    name: "Cairn Design System",
    description: "Shared component library used across product surfaces.",
    createdAt: "2026-08-02T09:00:00.000Z",
  },
];

const tasks: Task[] = [
  { id: "t-1", projectId: "proj-atlas", title: "Add per-route rate limit config", status: "done", priority: "high", dueDate: "2026-08-20", assigneeId: "user-1", createdAt: "2026-07-02T09:00:00.000Z" },
  { id: "t-2", projectId: "proj-atlas", title: "Write integration tests for auth middleware", status: "in-progress", priority: "high", dueDate: "2026-09-10", assigneeId: "user-1", createdAt: "2026-07-05T09:00:00.000Z" },
  { id: "t-3", projectId: "proj-atlas", title: "Document gateway error codes", status: "todo", priority: "low", dueDate: "2026-09-20", assigneeId: "user-2", createdAt: "2026-07-10T09:00:00.000Z" },
  { id: "t-4", projectId: "proj-atlas", title: "Upgrade to new load balancer", status: "blocked", priority: "medium", dueDate: "2026-09-15", assigneeId: null, createdAt: "2026-07-12T09:00:00.000Z" },
  { id: "t-5", projectId: "proj-beacon", title: "Retry queue for failed SMS sends", status: "in-progress", priority: "high", dueDate: "2026-09-12", assigneeId: "user-3", createdAt: "2026-07-15T09:00:00.000Z" },
  { id: "t-6", projectId: "proj-beacon", title: "Add delivery receipts webhook", status: "todo", priority: "medium", dueDate: "2026-09-25", assigneeId: "user-2", createdAt: "2026-07-16T09:00:00.000Z" },
  { id: "t-7", projectId: "proj-beacon", title: "Migrate email templates to MJML", status: "done", priority: "low", dueDate: "2026-08-30", assigneeId: "user-3", createdAt: "2026-07-18T09:00:00.000Z" },
  { id: "t-8", projectId: "proj-cairn", title: "Ship StatusBadge accessibility fixes", status: "in-progress", priority: "high", dueDate: "2026-09-09", assigneeId: "user-1", createdAt: "2026-08-03T09:00:00.000Z" },
  { id: "t-9", projectId: "proj-cairn", title: "Publish v2 design tokens", status: "todo", priority: "medium", dueDate: "2026-09-18", assigneeId: null, createdAt: "2026-08-04T09:00:00.000Z" },
];

const currentUser: User = {
  id: "user-1",
  name: "Aime Serge UKOBIZABA",
  role: "Backend Engineer",
  initials: "ASU",
};

const users: User[] = [
  currentUser,
  { id: "user-2", name: "Amara Diallo", role: "Frontend Engineer", initials: "AD" },
  { id: "user-3", name: "Kwame Mensah", role: "QA Engineer", initials: "KM" },
];

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface FetchOptions {
  simulateError?: boolean;
  latencyMs?: number;
}

export async function fetchProjects(opts: FetchOptions = {}): Promise<Project[]> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to load projects");
  }
  return delay([...projects], opts.latencyMs ?? 500);
}

export async function fetchProject(
  id: string,
  opts: FetchOptions = {},
): Promise<Project | null> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to load project");
  }
  const found = projects.find((p) => p.id === id) ?? null;
  return delay(found, opts.latencyMs ?? 400);
}

export async function fetchTasks(
  projectId?: string,
  opts: FetchOptions = {},
): Promise<Task[]> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to load tasks");
  }
  const result = projectId ? tasks.filter((t) => t.projectId === projectId) : [...tasks];
  return delay(result, opts.latencyMs ?? 600);
}

export async function fetchCurrentUser(opts: FetchOptions = {}): Promise<User> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 300);
    throw new Error("Failed to load profile");
  }
  return delay({ ...currentUser }, opts.latencyMs ?? 250);
}

export async function fetchUsers(opts: FetchOptions = {}): Promise<User[]> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 300);
    throw new Error("Failed to load users");
  }
  return delay([...users], opts.latencyMs ?? 300);
}

export function getProjectProgress(projectId: string, allTasks: Task[]): ProjectProgress {
  const projectTasks = allTasks.filter((t) => t.projectId === projectId);
  const done = projectTasks.filter((t) => t.status === "done").length;
  const total = projectTasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// CRUD below mutates the in-memory arrays above, mirroring the shape a
// real REST API (POST/PATCH/DELETE) would return, so ProjectFormModal/
// TaskFormModal work unmodified once wired to the real backend.

export async function createProject(
  input: { name: string; description?: string | null },
  opts: FetchOptions = {},
): Promise<Project> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to create project");
  }
  const project: Project = {
    id: nextId("proj"),
    name: input.name,
    description: input.description ?? null,
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  return delay({ ...project }, opts.latencyMs ?? 400);
}

export async function updateProject(
  id: string,
  input: { name?: string; description?: string | null },
  opts: FetchOptions = {},
): Promise<Project> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to update project");
  }
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error("Project not found");
  if (input.name !== undefined) project.name = input.name;
  if (input.description !== undefined) project.description = input.description;
  return delay({ ...project }, opts.latencyMs ?? 400);
}

export async function deleteProject(id: string, opts: FetchOptions = {}): Promise<void> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to delete project");
  }
  const index = projects.findIndex((p) => p.id === id);
  if (index !== -1) projects.splice(index, 1);
  for (let i = tasks.length - 1; i >= 0; i -= 1) {
    if (tasks[i].projectId === id) tasks.splice(i, 1);
  }
  await delay(null, opts.latencyMs ?? 400);
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  projectId: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export async function createTask(
  input: TaskCreateInput,
  opts: FetchOptions = {},
): Promise<Task> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to create task");
  }
  const task: Task = {
    id: nextId("t"),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? "todo",
    priority: input.priority ?? "medium",
    dueDate: input.dueDate ?? null,
    assigneeId: input.assigneeId ?? null,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return delay({ ...task }, opts.latencyMs ?? 400);
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  assigneeId?: string | null;
  clearDueDate?: boolean;
  clearAssignee?: boolean;
}

export async function updateTask(
  id: string,
  input: TaskUpdateInput,
  opts: FetchOptions = {},
): Promise<Task> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to update task");
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error("Task not found");
  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = input.description;
  if (input.priority !== undefined) task.priority = input.priority;
  if (input.clearDueDate) task.dueDate = null;
  else if (input.dueDate !== undefined) task.dueDate = input.dueDate;
  if (input.clearAssignee) task.assigneeId = null;
  else if (input.assigneeId !== undefined) task.assigneeId = input.assigneeId;
  return delay({ ...task }, opts.latencyMs ?? 400);
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  opts: FetchOptions = {},
): Promise<Task> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 300);
    throw new Error("Failed to update task status");
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error("Task not found");
  task.status = status;
  return delay({ ...task }, opts.latencyMs ?? 300);
}

export async function deleteTask(id: string, opts: FetchOptions = {}): Promise<void> {
  if (opts.simulateError) {
    await delay(null, opts.latencyMs ?? 400);
    throw new Error("Failed to delete task");
  }
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) tasks.splice(index, 1);
  await delay(null, opts.latencyMs ?? 400);
}
