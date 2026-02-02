import { z } from "zod";

const tagSchema = z.string().trim().min(1).max(30);
export const wardrobeSeasonSchema = z.enum([
  "verao",
  "inverno",
  "meia-estacao",
  "todas",
]);

const baseWardrobeItemSchema = z.object({
  category: z.string().trim().min(1).max(80),
  color: z.string().trim().min(1).max(50),
  material: z.string().trim().min(1).max(80),
  season: wardrobeSeasonSchema.optional().nullable(),
  notes: z.string().trim().min(1).max(500).optional().nullable(),
  imageUrl: z.string().trim().url().optional().nullable(),
  tags: z.array(tagSchema).max(20).optional(),
});

export const wardrobeItemCreateSchema = baseWardrobeItemSchema.extend({
  tags: z.array(tagSchema).max(20).optional().default([]),
});

export const wardrobeItemUpdateSchema = baseWardrobeItemSchema.partial();

export const wardrobeItemSchema = baseWardrobeItemSchema.extend({
  id: z.string().cuid(),
  tags: z.array(tagSchema),
  imageUrl: z.string().trim().url().nullable(),
  season: wardrobeSeasonSchema.nullable(),
  notes: z.string().trim().min(1).max(500).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type WardrobeItemCreate = z.infer<typeof wardrobeItemCreateSchema>;
export type WardrobeItemUpdate = z.infer<typeof wardrobeItemUpdateSchema>;
export type WardrobeItem = z.infer<typeof wardrobeItemSchema>;
