import Link from "next/link";
import { redirect } from "next/navigation";
import { Martini, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/session";

// Admin shell with a simple top bar + section nav. Guarded server-side in
// addition to the middleware check.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Martini className="h-5 w-5 text-accent" />
            <span className="font-bold text-ink">后台管理</span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> 返回应用
          </Link>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 px-5 pb-2 text-sm">
          {[
            { href: "/admin", label: "概览" },
            { href: "/admin/cocktails", label: "酒谱" },
            { href: "/admin/ingredients", label: "原料" },
            { href: "/admin/articles", label: "文章" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-muted transition hover:bg-cream hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-6">{children}</main>
    </div>
  );
}
