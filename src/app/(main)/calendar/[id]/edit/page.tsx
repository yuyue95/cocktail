import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { parseStringArray } from "@/lib/serialize";
import DrinkLogForm from "@/components/calendar/DrinkLogForm";

// Edit an existing tasting note. Only the owner may open it.
export default async function EditDrinkLogPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const log = await prisma.drinkLog.findUnique({ where: { id: params.id } });
  if (!log) notFound();
  if (log.userId !== user.id) redirect("/calendar");

  return (
    <DrinkLogForm
      initial={{
        id: log.id,
        cocktailId: log.cocktailId,
        customName: log.customName,
        loggedAt: log.loggedAt.toISOString(),
        rating: log.rating,
        flavorTags: parseStringArray(log.flavorTags),
        note: log.note,
        isHomemade: log.isHomemade,
      }}
    />
  );
}
