import { z } from "zod";

// Zod schemas shared between API route validation and react-hook-form resolvers.

export const registerSchema = z
  .object({
    name: z.string().min(1, "请输入昵称").max(30),
    email: z.string().email("邮箱格式不正确"),
    password: z.string().min(8, "密码至少 8 位"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export const drinkLogSchema = z.object({
  cocktailId: z.string().optional().nullable(),
  customName: z.string().max(60).optional().nullable(),
  loggedAt: z.string().min(1, "请选择日期"),
  rating: z.number().int().min(0).max(5).default(0),
  flavorTags: z.array(z.string()).default([]),
  note: z.string().max(2000).optional().nullable(),
  isHomemade: z.boolean().default(true),
});

export const userIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  amountNote: z.string().max(40).optional().nullable(),
});

export const businessLogSchema = z.object({
  loggedDate: z.string().min(1, "请选择日期"),
  note: z.string().max(2000).optional().nullable(),
  sales: z
    .array(
      z.object({
        cocktailId: z.string().optional().nullable(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
      })
    )
    .default([]),
});

export const inventorySchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  lowStockThreshold: z.number().min(0).default(0),
  unitCost: z.number().min(0).default(0),
});

export const purchaseSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  totalCost: z.number().min(0).default(0),
  purchasedAt: z.string().min(1),
  note: z.string().max(200).optional().nullable(),
});

export const barMenuSchema = z.object({
  cocktailId: z.string().min(1),
  price: z.number().min(0),
  cost: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Admin: cocktail create/update payload.
export const adminCocktailSchema = z.object({
  name: z.string().min(1, "请输入名称"),
  nameEn: z.string().optional().nullable(),
  slug: z.string().min(1, "请输入 slug"),
  category: z.string().min(1, "请选择分类"),
  flavorTags: z.array(z.string()).default([]),
  glassType: z.string().optional().nullable(),
  garnish: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  instructions: z.array(z.string()).default([]),
  imageUrl: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  isPublished: z.boolean().default(false),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string().min(1),
        amount: z.string().optional().nullable(),
        isOptional: z.boolean().default(false),
      })
    )
    .default([]),
});

// Admin: ingredient create/update payload.
export const adminIngredientSchema = z.object({
  name: z.string().min(1, "请输入名称"),
  nameEn: z.string().optional().nullable(),
  type: z.string().min(1),
  description: z.string().optional().nullable(),
  abv: z.number().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

// Admin: article create/update payload.
export const adminArticleSchema = z.object({
  title: z.string().min(1, "请输入标题"),
  slug: z.string().min(1, "请输入 slug"),
  content: z.string().min(1, "请输入正文"),
  category: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DrinkLogInput = z.infer<typeof drinkLogSchema>;
