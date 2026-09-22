import { useState } from "react";
import { t } from "@/i18n";
import { hardNavigate } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";
import type { Role } from "@/schemas";
import type { AvatarInput, RegistrationProfile } from "@/services/auth";
import { ServiceError } from "@/services/types";

export type PendingRegistration = {
  name: string;
  email: string;
  password: string;
  avatar: AvatarInput | undefined;
  profile: RegistrationProfile;
};

type FormErrors = {
  email?: string | undefined;
  password?: string | undefined;
  avatar?: string | undefined;
  profile?: string | undefined;
  form?: string | undefined;
};

/**
 * Owns the "ask which role, then submit" step that follows a validated registration
 * form: the wizard opens the role dialog with `open(data)`, and the dialog's
 * `onConfirm` calls `confirm(role)` to run the actual `auth.register` call.
 */
export function useRegisterFlow(setErrors: (errors: FormErrors) => void) {
  const { auth } = useAuth();
  const [busy, setBusy] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [pending, setPending] = useState<PendingRegistration | null>(null);

  const open = (data: PendingRegistration) => {
    setPending(data);
    setRoleDialogOpen(true);
  };

  const confirm = async (role: Role) => {
    if (pending === null) return;
    const { name, email, password, avatar, profile } = pending;
    setBusy(true);
    setErrors({});
    try {
      if (avatar === undefined) {
        await auth.register(name, email, password, undefined, profile, role);
      } else {
        await auth.register(name, email, password, avatar, profile, role);
      }
      hardNavigate("/login?registered=1");
    } catch (failure) {
      const conflict = failure instanceof ServiceError && failure.status === 409;
      setErrors(conflict ? { email: t("auth.emailTaken") } : { form: t("auth.genericError") });
      setBusy(false);
      // Close the dialog so the error is visible on the form step behind it, not hidden by it.
      setRoleDialogOpen(false);
    }
  };

  return { busy, roleDialogOpen, setRoleDialogOpen, open, confirm };
}
