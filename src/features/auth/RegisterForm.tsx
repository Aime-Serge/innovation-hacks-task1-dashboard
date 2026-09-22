"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { t } from "@/i18n";
import { AVATAR_ACCEPT, avatarFileProblem, isHttpsImageUrl } from "@/lib/avatar";
import { formText } from "@/lib/form";
import { hardNavigate } from "@/lib/navigation";
import type { AvatarInput } from "@/services/auth";
import { ServiceError } from "@/services/types";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { FormField } from "@/ui/FormField";
import { Input } from "@/ui/Input";
import { FormAlert } from "./messages";

const MIN_PASSWORD = 8;

/** Creating an account never signs anyone in: it sends them to the login page. */
export function RegisterForm() {
  const { auth } = useAuth();
  const [errors, setErrors] = useState<{
    email?: string | undefined;
    password?: string | undefined;
    avatar?: string | undefined;
    form?: string | undefined;
  }>({});
  const [busy, setBusy] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrlText, setAvatarUrlText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived from avatarFile, not its own state: the object URL only exists to preview a chosen
  // file, so it is computed during render and released once it is replaced or unmounted.
  const objectUrl = useMemo(
    () => (avatarFile !== null ? URL.createObjectURL(avatarFile) : null),
    [avatarFile],
  );
  useEffect(() => {
    return () => {
      if (objectUrl !== null) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewUrl = avatarFile !== null ? objectUrl : avatarUrlText.trim() || null;

  const chooseFile = (file: File | undefined) => {
    if (file === undefined) return;
    const problem = avatarFileProblem(file);
    if (problem !== null) {
      setErrors((e) => ({
        ...e,
        avatar: t(problem === "type" ? "auth.avatarInvalidType" : "auth.avatarTooLarge"),
      }));
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
      return;
    }
    setErrors((e) => ({ ...e, avatar: undefined }));
    setAvatarUrlText("");
    setAvatarFile(file);
  };

  const changeUrl = (value: string) => {
    setAvatarUrlText(value);
    setErrors((e) => ({ ...e, avatar: undefined }));
    if (value.trim() !== "") {
      setAvatarFile(null);
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
    }
  };

  const removePhoto = () => {
    setAvatarFile(null);
    setAvatarUrlText("");
    setErrors((e) => ({ ...e, avatar: undefined }));
    if (fileInputRef.current !== null) fileInputRef.current.value = "";
  };

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
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
    const avatar: AvatarInput | undefined =
      avatarFile !== null
        ? { kind: "file", file: avatarFile }
        : url !== ""
          ? { kind: "url", url }
          : undefined;
    setBusy(true);
    setErrors({});
    try {
      const name = text("name").trim();
      const email = text("email").trim();
      const password = text("password");
      if (avatar === undefined) await auth.register(name, email, password);
      else await auth.register(name, email, password, avatar);
      hardNavigate("/login?registered=1");
    } catch (failure) {
      const conflict = failure instanceof ServiceError && failure.status === 409;
      setErrors(conflict ? { email: t("auth.emailTaken") } : { form: t("auth.genericError") });
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-4">
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
      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? t("auth.creating") : t("auth.createAccount")}
      </Button>
      <p className="text-sm">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="text-accent-fg underline">
          {t("auth.login")}
        </Link>
      </p>
    </form>
  );
}
