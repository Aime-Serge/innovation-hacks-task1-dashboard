import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = { as?: ElementType; className?: string; children: ReactNode };

export function Card({ as: Tag = "div", className, children }: CardProps) {
  return (
    <Tag className={cn("rounded-lg border border-line bg-surface p-4 shadow-sm", className)}>
      {children}
    </Tag>
  );
}
