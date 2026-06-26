import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import MyCocktailForm from "@/components/cocktail/MyCocktailForm";

export const metadata: Metadata = { title: "新建配方" };

export default async function NewMyCocktailPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/my/cocktails/new");

  return (
    <main className="px-5 pt-6">
      <div className="flex items-center gap-2">
        <Link
          href="/my/cocktails"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-ink">新建配方</h1>
      </div>
      <div className="mt-5">
        <MyCocktailForm />
      </div>
    </main>
  );
}
