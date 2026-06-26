import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart, BookmarkPlus, History, ShieldCheck, PackagePlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { USER_MODES } from "@/lib/constants";
import ModeSwitcher from "@/components/profile/ModeSwitcher";
import SignOutButton from "@/components/profile/SignOutButton";

export const metadata: Metadata = { title: "我的" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/profile");

  // Gather a few lightweight stats for the header.
  const [drinkCount, favCount, wantCount, dbUser] = await Promise.all([
    prisma.drinkLog.count({ where: { userId: user.id } }),
    prisma.userCocktailList.count({
      where: { userId: user.id, listType: "favorite" },
    }),
    prisma.userCocktailList.count({
      where: { userId: user.id, listType: "want_to_make" },
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { mode: true } }),
  ]);
  const mode = dbUser?.mode ?? USER_MODES.DRINKER;
  const isBartender = mode === USER_MODES.BARTENDER;

  return (
    <main className="px-5 pt-6">
      <h1 className="text-xl font-bold text-ink">我的</h1>

      {/* Identity card */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-bold text-cream">
          {(user.name ?? "U").slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="调酒记录" value={drinkCount} />
        <Stat label="收藏" value={favCount} />
        <Stat label="想做" value={wantCount} />
      </div>

      {/* Mode switch */}
      <div className="mt-4">
        <ModeSwitcher mode={mode} />
      </div>

      {/* Quick links */}
      <div className="mt-4 space-y-2">
        <ProfileLink href="/bar" icon={<Heart className="h-4 w-4" />} label="我的收藏与想做" />
        <ProfileLink
          href="/calendar"
          icon={<History className="h-4 w-4" />}
          label="调酒历史"
        />
        {isBartender && (
          <ProfileLink
            href="/profile/purchases"
            icon={<PackagePlus className="h-4 w-4" />}
            label="进货记录"
          />
        )}
        {user.role === "admin" && (
          <ProfileLink
            href="/admin"
            icon={<ShieldCheck className="h-4 w-4" />}
            label="后台管理"
          />
        )}
      </div>

      <div className="mt-4">
        <SignOutButton />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

function ProfileLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-ink transition hover:bg-cream"
    >
      <span className="text-muted">{icon}</span>
      {label}
    </Link>
  );
}
