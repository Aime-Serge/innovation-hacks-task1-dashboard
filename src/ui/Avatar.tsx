import { Avatar as RadixAvatar } from "radix-ui";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
} as const;

type AvatarProps = { name: string; src?: string | undefined; size?: keyof typeof SIZES };

/** Decorative: the person's name is always shown in text next to it. */
export function Avatar({ name, src, size = "md" }: AvatarProps) {
  return (
    <RadixAvatar.Root
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        "bg-accent-subtle font-semibold text-accent-fg",
        SIZES[size],
      )}
    >
      {src !== undefined && (
        <RadixAvatar.Image src={src} alt="" className="size-full object-cover" />
      )}
      <RadixAvatar.Fallback>{initials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
