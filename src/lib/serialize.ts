// SQLite stores arrays as JSON strings. These helpers centralize the
// (de)serialization so models can expose real string[] to the app layer.
// When migrating to PostgreSQL (native arrays), only this file needs changing.

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function stringifyStringArray(value: string[] | undefined | null): string {
  return JSON.stringify(value ?? []);
}

// Personal-recipe ingredients are free-text objects (no FK to the master
// Ingredient table), stored as a JSON string on UserCocktail.ingredients.
export type RecipeIngredient = {
  name: string;
  amount: string;
  isOptional: boolean;
};

export function parseRecipeIngredients(
  value: string | null | undefined
): RecipeIngredient[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.name === "string")
      .map((x) => ({
        name: String(x.name),
        amount: typeof x.amount === "string" ? x.amount : "",
        isOptional: Boolean(x.isOptional),
      }));
  } catch {
    return [];
  }
}

export function stringifyRecipeIngredients(
  value: RecipeIngredient[] | undefined | null
): string {
  return JSON.stringify(value ?? []);
}
