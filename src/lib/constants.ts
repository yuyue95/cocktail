// Shared enumerations and labels. Kept in one place so both the seed script,
// the admin forms, and the UI render from the same source of truth.

export const COCKTAIL_CATEGORIES = [
  "便利店调酒",
  "IBA-当代经典",
  "IBA-新时代创新",
  "IBA-难忘经典",
  "聚会桶酒",
  "清新酸甜 (The Sour Family)",
  "畅爽气泡 (The Highball Family)",
  "醇厚烈酒 (The Spirit-Forward Family)",
  "馥郁果香 (The Fruity & Tropical Family)",
] as const;

export type CocktailCategory = (typeof COCKTAIL_CATEGORIES)[number];

export const INGREDIENT_TYPES = [
  { value: "base_spirit", label: "基酒" },
  { value: "liqueur", label: "利口酒" },
  { value: "juice", label: "果汁" },
  { value: "syrup", label: "糖浆" },
  { value: "mixer", label: "气泡/软饮" },
  { value: "garnish", label: "装饰物" },
  { value: "other", label: "其他" },
] as const;

export type IngredientType = (typeof INGREDIENT_TYPES)[number]["value"];

export const DIFFICULTIES = [
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "进阶" },
] as const;

// Common base spirits used as quick-filter chips on the home search area.
export const BASE_SPIRIT_FILTERS = [
  "金酒",
  "威士忌",
  "伏特加",
  "朗姆酒",
  "白兰地",
  "龙舌兰",
] as const;

// Flavor tags offered when logging a drink in the calendar.
export const FLAVOR_TAGS = [
  "太甜",
  "太酸",
  "太烈",
  "刚好",
  "清爽",
  "厚重",
  "果香",
  "层次丰富",
  "苦",
  "顺口",
] as const;

export const USER_MODES = {
  DRINKER: "drinker",
  BARTENDER: "bartender",
} as const;

export type UserMode = (typeof USER_MODES)[keyof typeof USER_MODES];

export const INVENTORY_UNITS = ["ml", "bottle", "g", "dash", "piece"] as const;

export function ingredientTypeLabel(value: string): string {
  return INGREDIENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function difficultyLabel(value: string): string {
  return DIFFICULTIES.find((d) => d.value === value)?.label ?? value;
}
