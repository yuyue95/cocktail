import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseStringArray } from "@/lib/serialize";
import CocktailForm from "@/components/admin/CocktailForm";

export default async function EditCocktailPage({
  params,
}: {
  params: { id: string };
}) {
  const c = await prisma.cocktail.findUnique({
    where: { id: params.id },
    include: { ingredients: { orderBy: { sortOrder: "asc" } } },
  });
  if (!c) notFound();

  return (
    <CocktailForm
      initial={{
        id: c.id,
        name: c.name,
        nameEn: c.nameEn ?? "",
        slug: c.slug,
        category: c.category,
        flavorTags: parseStringArray(c.flavorTags),
        glassType: c.glassType ?? "",
        garnish: c.garnish ?? "",
        description: c.description ?? "",
        instructions: parseStringArray(c.instructions),
        imageUrl: c.imageUrl ?? "",
        difficulty: c.difficulty,
        isPublished: c.isPublished,
        ingredients: c.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          amount: i.amount ?? "",
          isOptional: i.isOptional,
        })),
      }}
    />
  );
}
