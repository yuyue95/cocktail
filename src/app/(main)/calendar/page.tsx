import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { USER_MODES } from "@/lib/constants";
import DrinkerCalendar from "@/components/calendar/DrinkerCalendar";
import BartenderCalendar from "@/components/calendar/BartenderCalendar";

export const metadata: Metadata = { title: "日历" };

// The calendar adapts to the user's identity: a tasting journal for drinkers,
// a daily takings ledger for bartenders.
export default async function CalendarPage() {
  const user = await getCurrentUser();
  const mode = user?.mode ?? USER_MODES.DRINKER;

  return mode === USER_MODES.BARTENDER ? (
    <BartenderCalendar />
  ) : (
    <DrinkerCalendar />
  );
}
