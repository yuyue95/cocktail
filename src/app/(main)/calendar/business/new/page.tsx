import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { USER_MODES } from "@/lib/constants";
import BusinessLogForm from "@/components/calendar/BusinessLogForm";

// Bartender-only: record a day's takings.
export default async function NewBusinessLogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mode !== USER_MODES.BARTENDER) redirect("/calendar");

  return <BusinessLogForm />;
}
