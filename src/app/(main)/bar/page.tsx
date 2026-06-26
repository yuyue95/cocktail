import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { USER_MODES } from "@/lib/constants";
import DrinkerBar from "@/components/bar/DrinkerBar";
import BartenderBar from "@/components/bar/BartenderBar";

export const metadata: Metadata = { title: "吧台" };

// The bar adapts to identity: drinkers track loose ingredients to get "what can
// I make" suggestions; bartenders manage a priced menu and precise stock.
export default async function BarPage() {
  const user = await getCurrentUser();
  const mode = user?.mode ?? USER_MODES.DRINKER;

  return mode === USER_MODES.BARTENDER ? <BartenderBar /> : <DrinkerBar />;
}
