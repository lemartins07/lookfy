import { z } from "zod";

export const wardrobeModeSchema = z.enum(["capsula", "livre"]);

const nullableString = z.string().min(1).nullable();

export const styleProfileSchema = z.object({
  perception: nullableString.optional(),
  styles: nullableString.optional(),
  colorsPreferred: nullableString.optional(),
  colorsAvoid: nullableString.optional(),
  occasions: nullableString.optional(),
  formality: z.enum(["baixo", "medio", "alto"]).nullable().optional(),
  silhouettes: nullableString.optional(),
  materials: nullableString.optional(),
  avoidPieces: nullableString.optional(),
  wardrobeMode: wardrobeModeSchema.nullable().optional(),
});

export const styleProfileResponseSchema = z.object({
  profile: styleProfileSchema.nullable(),
});

export type StyleProfile = z.infer<typeof styleProfileSchema>;
export type StyleProfileResponse = z.infer<typeof styleProfileResponseSchema>;
