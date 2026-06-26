import DrinkLogForm from "@/components/calendar/DrinkLogForm";

export const dynamic = "force-dynamic";

// New tasting note. An optional ?cocktailId= preselects the drink (used by the
// "记录喝过" button on a recipe page).
export default function NewDrinkLogPage({
  searchParams,
}: {
  searchParams: { cocktailId?: string };
}) {
  return <DrinkLogForm presetCocktailId={searchParams.cocktailId} />;
}
