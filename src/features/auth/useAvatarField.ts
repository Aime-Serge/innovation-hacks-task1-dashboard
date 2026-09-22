import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/i18n";
import { avatarFileProblem } from "@/lib/avatar";

type SetAvatarError = (updater: (avatar: string | undefined) => string | undefined) => void;

/** The photo picker's state: an uploaded file or a pasted link, mutually exclusive. */
export function useAvatarField(setAvatarErrorField: SetAvatarError) {
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
      setAvatarErrorField(() =>
        t(problem === "type" ? "auth.avatarInvalidType" : "auth.avatarTooLarge"),
      );
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
      return;
    }
    setAvatarErrorField(() => undefined);
    setAvatarUrlText("");
    setAvatarFile(file);
  };

  const changeUrl = (value: string) => {
    setAvatarUrlText(value);
    setAvatarErrorField(() => undefined);
    if (value.trim() !== "") {
      setAvatarFile(null);
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
    }
  };

  const removePhoto = () => {
    setAvatarFile(null);
    setAvatarUrlText("");
    setAvatarErrorField(() => undefined);
    if (fileInputRef.current !== null) fileInputRef.current.value = "";
  };

  return {
    avatarFile,
    avatarUrlText,
    previewUrl,
    fileInputRef,
    chooseFile,
    changeUrl,
    removePhoto,
  };
}
