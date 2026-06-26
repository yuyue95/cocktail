import type {
  Cocktail,
  CocktailIngredient,
  Ingredient,
  UserCocktail,
} from "@prisma/client";
import {
  parseStringArray,
  parseRecipeIngredients,
  type RecipeIngredient,
} from "@/lib/serialize";

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

// Personal recipe DTO: parses both the tag/step string arrays and the
// free-text ingredient JSON into real arrays.
export type UserCocktailDTO = Omit<
  UserCocktail,
  "flavorTags" | "instructions" | "ingredients"
> & {
  flavorTags: string[];
  instructions: string[];
  ingredients: RecipeIngredient[];
};

export function toUserCocktailDTO(c: UserCocktail): UserCocktailDTO {
  return {
    ...c,
    flavorTags: parseStringArray(c.flavorTags),
    instructions: parseStringArray(c.instructions),
    ingredients: parseRecipeIngredients(c.ingredients),
  };
}
