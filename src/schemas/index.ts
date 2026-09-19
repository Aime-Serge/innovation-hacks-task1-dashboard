import { z } from "zod";

// Every type in the app is inferred from these schemas (no hand-written
// duplicates). The mock adapter parses every response with them, so a parse
// failure surfaces as an error state (TH-03).

export const TaskStatus = z.enum(["todo", "in_progress", "in_review", "done"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const Priority = z.enum(["low", "medium", "high", "urgent"]);
export type Priority = z.infer<typeof Priority>;

export const ProjectStatus = z.enum(["planned", "active", "on_hold", "completed"]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const Role = z.enum(["developer", "lead"]);
export type Role = z.infer<typeof Role>;

export const Theme = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof Theme>;

export const ActivityType = z.enum(["created", "status_changed", "completed"]);
export type ActivityType = z.infer<typeof ActivityType>;

export const Scenario = z.enum([
  "default",
  "loading",
  "empty",
  "error",
  "partial-error",
  "flaky",
  "update-fails",
  "large",
  "edge-text",
]);
export type Scenario = z.infer<typeof Scenario>;

const IsoDate = z.iso.date();

export const User = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  email: z.email(),
  role: Role,
  avatarUrl: z.string().optional(),
  preferences: z.object({ theme: Theme }),
});
export type User = z.infer<typeof User>;

export const Project = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  description: z.string().max(500),
  status: ProjectStatus,
  dueDate: IsoDate,
  ownerId: z.string().min(1),
});
export type Project = z.infer<typeof Project>;

export const Task = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().max(1000),
  status: TaskStatus,
  priority: Priority,
  dueDate: IsoDate.nullable(),
  assigneeId: z.string().nullable(),
});
export type Task = z.infer<typeof Task>;

export const Activity = z.object({
  id: z.string().min(1),
  actorId: z.string().min(1),
  projectId: z.string().min(1),
  taskId: z.string().optional(),
  type: ActivityType,
  at: z.iso.datetime(),
});
export type Activity = z.infer<typeof Activity>;

export function pageOf<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), total: z.number().int().nonnegative() });
}
export type Page<T> = { items: T[]; total: number };

export const TaskSort = z.enum(["due_date", "priority", "title"]);
export type TaskSort = z.infer<typeof TaskSort>;

export const ProjectSort = z.enum(["name", "due_date"]);
export type ProjectSort = z.infer<typeof ProjectSort>;

export const SortDir = z.enum(["asc", "desc"]);
export type SortDir = z.infer<typeof SortDir>;

export type TaskQuery = {
  q: string;
  status: TaskStatus[];
  priority: Priority[];
  projectId: string[];
  assigneeId: string | null;
  sort: TaskSort;
  dir: SortDir;
};

export type ProjectQuery = {
  q: string;
  status: ProjectStatus[];
  sort: ProjectSort;
  dir: SortDir;
};

export const emptyTaskQuery = (): TaskQuery => ({
  q: "",
  status: [],
  priority: [],
  projectId: [],
  assigneeId: null,
  sort: "due_date",
  dir: "asc",
});

export const emptyProjectQuery = (): ProjectQuery => ({
  q: "",
  status: [],
  sort: "name",
  dir: "asc",
});

export const NewProject = Project.omit({ id: true });
export type NewProject = z.infer<typeof NewProject>;
export const NewTask = Task.omit({ id: true });
export type NewTask = z.infer<typeof NewTask>;

/** The error envelope, shared with the Task 2 FastAPI backend. */
export const ApiErrorBody = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;
