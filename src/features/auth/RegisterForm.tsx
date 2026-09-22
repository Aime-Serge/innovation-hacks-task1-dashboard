"use client";

import Link from "next/link";
import { useState, type SyntheticEvent } from "react";
import { t } from "@/i18n";
import { AVATAR_ACCEPT, isHttpsImageUrl } from "@/lib/avatar";
import { formText } from "@/lib/form";
import type { AvatarInput } from "@/services/auth";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { FormField } from "@/ui/FormField";
import { Input } from "@/ui/Input";
import { FormAlert } from "./messages";
import { RegisterRoleDialog } from "./RegisterRoleDialog";
import { RegistrationProfileFields } from "./RegistrationProfileFields";
import { registrationProfile } from "./registration-profile";
import { useAvatarField } from "./useAvatarField";
import { useRegisterFlow } from "./useRegisterFlow";

const MIN_PASSWORD = 8;

/** Creating an account never signs anyone in: it sends them to the login page. */
export function RegisterForm() {
  const [errors, setErrors] = useState<{
    email?: string | undefined;
    password?: string | undefined;
    avatar?: string | undefined;
    profile?: string | undefined;
    form?: string | undefined;
  }>({});
  const { busy, roleDialogOpen, setRoleDialogOpen, open, confirm } = useRegisterFlow(setErrors);
  const setAvatarError = (updater: (avatar: string | undefined) => string | undefined) =>
    setErrors((e) => ({ ...e, avatar: updater(e.avatar) }));
  const {
    avatarFile,
    avatarUrlText,
    previewUrl,
    fileInputRef,
    chooseFile,
    changeUrl,
    removePhoto,
  } = useAvatarField(setAvatarError);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Validates the whole form, then opens RegisterRoleDialog instead of submitting directly;
  // the dialog's onConfirm runs the actual auth.register call (useRegisterFlow.confirm).
  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => formText(form, key);
    if (text("password").length < MIN_PASSWORD) {
      setErrors({ password: t("auth.passwordShort", { min: MIN_PASSWORD }) });
      return;
    }
    if (text("password") !== text("confirm")) {
      setErrors({ password: t("auth.passwordMismatch") });
      return;
    }
    // A rejected file leaves its message up until it is replaced or cleared; do not silently
    // register without the photo the person was still trying to fix.
    if (errors.avatar !== undefined) return;
    const url = avatarUrlText.trim();
    if (url !== "" && !isHttpsImageUrl(url)) {
      setErrors({ avatar: t("auth.avatarInvalidUrl") });
      return;
    }
    const profile = registrationProfile(form, termsAccepted, ageConfirmed);
    if (profile === null) {
      setErrors({ profile: t("auth.profileRequired") });
      return;
    }
    const avatar: AvatarInput | undefined =
      avatarFile !== null
        ? { kind: "file", file: avatarFile }
        : url !== ""
          ? { kind: "url", url }
          : undefined;
    open({
      name: text("name").trim(),
      email: text("email").trim(),
      password: text("password"),
      avatar,
      profile,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {errors.form !== undefined && <FormAlert>{errors.form}</FormAlert>}
      <FormField id="reg-name" label={t("auth.name")}>
        {(c) => <Input {...c} name="name" autoComplete="name" required maxLength={80} />}
      </FormField>
      <FormField id="reg-email" label={t("auth.email")} error={errors.email}>
        {(c) => <Input {...c} name="email" type="email" autoComplete="email" required />}
      </FormField>
      <FormField id="reg-password" label={t("auth.password")} error={errors.password}>
        {(c) => (
          <Input {...c} name="password" type="password" autoComplete="new-password" required />
        )}
      </FormField>
      <FormField id="reg-confirm" label={t("auth.confirmPassword")}>
        {(c) => (
          <Input {...c} name="confirm" type="password" autoComplete="new-password" required />
        )}
      </FormField>
      <div className="flex flex-col gap-2 rounded-md border border-line-strong p-3">
        <div className="flex items-center gap-3">
          <Avatar name="" avatarUrl={previewUrl} size="lg" />
          <p className="text-sm text-muted">{t("auth.avatarHint")}</p>
        </div>
        <FormField id="reg-avatar-file" label={t("auth.avatarUpload")} error={errors.avatar}>
          {(c) => (
            <Input
              {...c}
              ref={fileInputRef}
              name="avatarFile"
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          )}
        </FormField>
        <FormField id="reg-avatar-url" label={t("auth.avatarUrl")}>
          {(c) => (
            <Input
              {...c}
              name="avatarUrl"
              type="url"
              placeholder="https://…"
              value={avatarUrlText}
              onChange={(event) => changeUrl(event.target.value)}
            />
          )}
        </FormField>
        {(previewUrl !== null || errors.avatar !== undefined) && (
          <Button type="button" size="sm" onClick={removePhoto} className="self-start">
            {t("auth.avatarRemove")}
          </Button>
        )}
      </div>
      {errors.profile !== undefined && <FormAlert>{errors.profile}</FormAlert>}
      <RegistrationProfileFields
        termsAccepted={termsAccepted}
        ageConfirmed={ageConfirmed}
        onTermsAccepted={setTermsAccepted}
        onAgeConfirmed={setAgeConfirmed}
      />
      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? t("auth.creating") : t("auth.createAccount")}
      </Button>
      <p className="text-sm">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="text-accent-fg underline">
          {t("auth.login")}
        </Link>
      </p>
      <RegisterRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        busy={busy}
        onConfirm={(role) => void confirm(role)}
      />
    </form>
  );
}
