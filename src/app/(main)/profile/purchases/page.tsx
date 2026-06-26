import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { USER_MODES } from "@/lib/constants";
import PurchasesView from "@/components/bar/PurchasesView";

export const metadata: Metadata = { title: "进货记录" };

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mode !== USER_MODES.BARTENDER) redirect("/profile");

  return <PurchasesView />;
}
