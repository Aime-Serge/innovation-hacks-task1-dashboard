import { t } from "@/i18n";

const REPO = "https://github.com/Aime-Serge/innovation-hacks-task1-dashboard";

/** A server component: the footer adds no client JavaScript (NFR-04). */
export function Footer() {
  return (
    <footer
      aria-label={t("footer.label")}
      className="border-t border-line bg-surface px-4 py-4 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-(--content-max) flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-fg">{t("footer.project")}</p>
          <p>{t("footer.demo")}</p>
        </div>
        <ul className="flex gap-4">
          <li>
            <a
              href={REPO}
              rel="noopener noreferrer"
              className="touch-target inline-flex items-center underline"
            >
              {t("footer.repo")}
            </a>
          </li>
          <li>
            <a
              href={`${REPO}/tree/task/1-frontend/docs`}
              rel="noopener noreferrer"
              className="touch-target inline-flex items-center underline"
            >
              {t("footer.docs")}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
