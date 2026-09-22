import { useState } from "react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
} as const;

type AvatarProps = {
  name: string;
  avatarUrl?: string | null | undefined;
  size?: keyof typeof SIZES;
};

/**
 * The person's photo when they have one, otherwise their initials. Decorative either way: the
 * name is always shown in text next to it. A plain `<img>`, not `next/image` (ADR-018): the
 * source can be a `data:` URL (an uploaded file, once stored), a `blob:` object URL (that same
 * file previewed before it is stored), or any host a person pasted a link to — none of which the
 * image optimizer can pre-configure for, and `blob:` sources fail its own URL parsing outright.
 * A photo that fails to load (a dead link, an offline network) falls back to initials rather
 * than a broken-image icon.
 */
export function Avatar({ name, avatarUrl, size = "md" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = typeof avatarUrl === "string" && avatarUrl !== "" && !failed;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        "bg-accent-subtle font-semibold text-accent-fg",
        SIZES[size],
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- ADR-018: blob:/data: sources.
        <img
          src={avatarUrl}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
