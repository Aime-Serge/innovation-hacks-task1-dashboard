import { t } from "@/i18n";
import { Card } from "@/ui/Card";
import type { TeamMemberStats } from "./teamStats";

type Props = { stats: readonly TeamMemberStats[] };

/** Team lead only (FR: role dashboards). Fed entirely from data the dashboard already fetched. */
export function TeamPanel({ stats }: Props) {
  return (
    <section aria-labelledby="team-heading">
      <h2 id="team-heading" className="mb-3 text-lg font-semibold">
        {t("dashboard.team")}
      </h2>
      <Card as="ul" className="flex flex-col gap-3">
        {stats.map((member) => (
          <li key={member.userId} className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-fg">{member.name}</span>
            <span className="text-muted">
              {t("dashboard.team.openTasks", { count: member.openTasks })}
              {" · "}
              {t("dashboard.team.overdueTasks", { count: member.overdueTasks })}
            </span>
          </li>
        ))}
      </Card>
    </section>
  );
}
