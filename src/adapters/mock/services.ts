import { Activity, Project, Task, User, pageOf } from "@/schemas";
import type { Scenario } from "@/schemas";
import { applyProjectQuery, applyTaskQuery } from "@/lib/query-logic";
import { ServiceError } from "@/services/types";
import type { Services } from "@/services/types";
import { findById, getAccounts, saveAccounts } from "./accounts";
import { Behavior, type Latency } from "./behavior";
import { buildFixtures, type Fixtures } from "./fixtures";

export type MockOptions = {
  scenario: Scenario;
  latency?: Latency;
  now?: Date;
  actorId?: string;
};

export type MockSession = { services: Services; snapshot: () => Fixtures };

const notFound = (what: string) => new ServiceError("not_found", `${what} was not found.`, 404);

/**
 * The in-memory implementation of every service. State lives for the session
 * and resets on reload; nothing about projects or tasks touches browser storage.
 */
export function createMockServices(options: MockOptions): MockSession {
  const data = buildFixtures(options.scenario, options.now);
  const behavior = new Behavior(options.scenario, options.latency);
  const now = () => options.now ?? new Date();
  let nextId = 1000;
  const newId = (prefix: string) => `${prefix}-${nextId++}`;

  const record = (type: Activity["type"], task: Task) => {
    data.activity.unshift({
      id: newId("activity"),
      actorId: options.actorId ?? "user-1",
      projectId: task.projectId,
      taskId: task.id,
      type,
      at: now().toISOString(),
    });
  };

  const findTask = (id: string): Task => {
    const task = data.tasks.find((t) => t.id === id);
    if (task === undefined) throw notFound("That task");
    return task;
  };

  const projects: Services["projects"] = {
    async list(query, signal) {
      await behavior.wait(signal);
      behavior.checkList("projects");
      const items = applyProjectQuery(data.projects, query);
      return pageOf(Project).parse({ items, total: items.length });
    },
    async get(id, signal) {
      await behavior.wait(signal);
      behavior.checkList("projects");
      const found = data.projects.find((p) => p.id === id);
      return found === undefined ? null : Project.parse(found);
    },
    async create(input) {
      await behavior.wait();
      const project = Project.parse({ ...input, id: newId("project") });
      data.projects.push(project);
      return project;
    },
    async update(id, patch) {
      await behavior.wait();
      const index = data.projects.findIndex((p) => p.id === id);
      const current = data.projects[index];
      if (current === undefined) throw notFound("That project");
      const next = Project.parse({ ...current, ...patch });
      data.projects[index] = next;
      return next;
    },
    async remove(id) {
      await behavior.wait();
      data.projects = data.projects.filter((p) => p.id !== id);
      data.tasks = data.tasks.filter((t) => t.projectId !== id);
    },
  };

  const tasks: Services["tasks"] = {
    async list(query, signal) {
      await behavior.wait(signal);
      behavior.checkList("tasks");
      const items = applyTaskQuery(data.tasks, query);
      return pageOf(Task).parse({ items, total: items.length });
    },
    async updateStatus(id, status) {
      await behavior.wait();
      behavior.checkStatusChange();
      const task = findTask(id);
      const next = Task.parse({ ...task, status });
      data.tasks[data.tasks.indexOf(task)] = next;
      record(status === "done" ? "completed" : "status_changed", next);
      return next;
    },
    async create(input) {
      await behavior.wait();
      const task = Task.parse({ ...input, id: newId("task") });
      data.tasks.push(task);
      record("created", task);
      return task;
    },
    async update(id, patch) {
      await behavior.wait();
      const task = findTask(id);
      const next = Task.parse({ ...task, ...patch });
      data.tasks[data.tasks.indexOf(task)] = next;
      return next;
    },
    async remove(id) {
      await behavior.wait();
      data.tasks = data.tasks.filter((t) => t.id !== id);
    },
  };

  /** Fixture users overlaid with registered accounts (which win on id). */
  const allUsers = (): User[] => {
    const accounts = getAccounts().map((a) => a.user);
    const ids = new Set(accounts.map((u) => u.id));
    return [...data.users.filter((u) => !ids.has(u.id)), ...accounts];
  };

  const users: Services["users"] = {
    async list(signal) {
      await behavior.wait(signal);
      behavior.checkList("users");
      return User.array().parse(allUsers());
    },
    async get(id, signal) {
      await behavior.wait(signal);
      behavior.checkList("users");
      const found = allUsers().find((u) => u.id === id);
      return found === undefined ? null : User.parse(found);
    },
    async update(id, patch) {
      await behavior.wait();
      const account = findById(id);
      const target = account?.user ?? data.users.find((u) => u.id === id);
      if (target === undefined) throw notFound("That user");
      if (patch.name !== undefined) target.name = patch.name;
      if (patch.theme !== undefined) target.preferences = { theme: patch.theme };
      if (account !== undefined) saveAccounts();
      return User.parse(target);
    },
  };

  const activity: Services["activity"] = {
    async list(limit, signal) {
      await behavior.wait(signal);
      behavior.checkList("activity");
      return Activity.array().parse(data.activity.slice(0, limit));
    },
  };

  return { services: { projects, tasks, users, activity }, snapshot: () => data };
}
