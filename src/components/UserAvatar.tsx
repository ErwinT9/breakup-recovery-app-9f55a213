import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Soft pastel fallback backgrounds, picked deterministically from the name. */
const TINTS = ["bg-mint", "bg-sky", "bg-lavender", "bg-coral", "bg-primary-soft"] as const;

function tintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return TINTS[hash % TINTS.length] ?? "bg-mint";
}

/**
 * Circular profile avatar: photo when available, otherwise the first initial
 * on a pastel tint, otherwise a generic person icon.
 */
export function UserAvatar({
  src,
  name,
  className,
  alt,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
  alt?: string;
}) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() ?? "";
  return (
    <Avatar className={cn("size-10", className)}>
      {src ? <AvatarImage src={src} alt={alt ?? name ?? "Profile photo"} className="object-cover" /> : null}
      <AvatarFallback className={cn(tintFor(name || "friend"), "text-on-tint font-semibold")}>
        {initial || <UserRound className="size-1/2" aria-hidden />}
      </AvatarFallback>
    </Avatar>
  );
}