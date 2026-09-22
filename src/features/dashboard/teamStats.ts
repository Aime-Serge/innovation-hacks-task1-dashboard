import { isOverdue } from "@/lib/dates";
import type { Task, User } from "@/schemas";

export type TeamMemberStats = {
  userId: string;
  name: string;
  openTasks: number;
  overdueTasks: number;
};

/**
 * Groups tasks already fetched by the dashboard by `assigneeId`, one row per
 * user. No new query: both `tasks` and `users` come from the dashboard's own
 * existing queries (FR: a team lead's roll-up must never cost a developer an
 * extra fetch).
 */
export function teamStats(
  tasks: readonly Task[],
  users: readonly User[],
  today: string,
): TeamMemberStats[] {
  return users.map((user) => {
    const assigned = tasks.filter((task) => task.assigneeId === user.id);
    return {
      userId: user.id,
      name: user.name,
      openTasks: assigned.filter((task) => task.status !== "done").length,
      overdueTasks: assigned.filter((task) => isOverdue(task, today)).length,
    };
  });
}
