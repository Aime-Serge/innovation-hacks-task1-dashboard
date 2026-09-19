import { t } from "@/i18n";
import { Button } from "./Button";
import { Icon } from "./Icon";

type ErrorStateProps = { title?: string; body?: string; onRetry: () => void };

export function ErrorState({ title, body, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-lg border border-line bg-danger-bg px-4 py-10 text-center"
    >
      <Icon name="alertCircle" className="size-8 text-danger" />
      <h3 className="text-base font-semibold text-danger">{title ?? t("state.error.title")}</h3>
      <p className="max-w-md text-sm text-fg">{body ?? t("state.error.body")}</p>
      <Button variant="secondary" onClick={onRetry}>
        {t("common.retry")}
      </Button>
    </div>
  );
}
