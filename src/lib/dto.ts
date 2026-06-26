import type {
  Cocktail,
  CocktailIngredient,
  Ingredient,
} from "@prisma/client";
import { parseStringArray } from "@/lib/serialize";

// Client-facing shapes: JSON string fields are parsed into real arrays here so
// no component ever deals with the SQLite storage format.

export type CocktailDTO = Omit<Cocktail, "flavorTags" | "instructions"> & {
  flavorTags: string[];
  instructions: string[];
};

export type CocktailWithIngredientsDTO = CocktailDTO & {
  ingredients: (CocktailIngredient & { ingredient: Ingredient })[];
};

export function toCocktailDTO(c: Cocktail): CocktailDTO {
  return {
    ...c,
    flavorTags: parseStringArray(c.flavorTags),
    instructions: parseStringArray(c.instructions),
  };
}

export function toCocktailWithIngredientsDTO(
  c: Cocktail & {
    ingredients: (CocktailIngredient & { ingredient: Ingredient })[];
  }
): CocktailWithIngredientsDTO {
  return {
    ...toCocktailDTO(c),
    ingredients: c.ingredients,
  };
}
