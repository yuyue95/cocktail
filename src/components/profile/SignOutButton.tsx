"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left text-ink transition hover:bg-cream"
    >
      <LogOut className="h-4 w-4 text-muted" />
      退出登录
    </button>
  );
}
