"use client";

import { useState } from "react";
import { t } from "@/i18n";
import type { Role } from "@/schemas";
import { Button } from "@/ui/Button";
import { Dialog } from "@/ui/Dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy: boolean;
  onConfirm: (role: Role) => void;
};

const OPTIONS: { role: Role; label: string; description: string }[] = [
  {
    role: "developer",
    label: t("auth.roleDialog.developer.label"),
    description: t("auth.roleDialog.developer.description"),
  },
  {
    role: "lead",
    label: t("auth.roleDialog.lead.label"),
    description: t("auth.roleDialog.lead.description"),
  },
];

/**
 * Shown after the registration wizard's last step. Cancel closes without
 * resetting the choice (no useEffect needed: the selection simply survives
 * until the dialog is confirmed or the form itself unmounts).
 */
export function RegisterRoleDialog({ open, onOpenChange, busy, onConfirm }: Props) {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t("auth.roleDialog.title")}>
      <fieldset className="flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <label
            key={option.role}
            htmlFor={`register-role-${option.role}`}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-line-strong p-3 has-[:checked]:border-accent"
          >
            <input
              id={`register-role-${option.role}`}
              type="radio"
              name="role"
              value={option.role}
              checked={role === option.role}
              onChange={() => setRole(option.role)}
              aria-label={option.label}
              className="mt-1"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-fg">{option.label}</span>
              <span className="text-sm text-muted">{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="mt-3 text-sm text-muted">{t("auth.roleDialog.changeLater")}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" onClick={() => onOpenChange(false)} disabled={busy}>
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={role === null || busy}
          onClick={() => {
            if (role !== null) onConfirm(role);
          }}
        >
          {busy ? t("auth.creating") : t("auth.createAccount")}
        </Button>
      </div>
    </Dialog>
  );
}
