"use client";

import { UserButton } from "@clerk/nextjs";

export function UserMenu({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return (
      <span
        className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-xs font-medium text-foreground/70"
        aria-label="Demo uživatel"
      >
        D
      </span>
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
        },
      }}
    />
  );
}
