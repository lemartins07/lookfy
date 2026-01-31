import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

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
});

export const styleChatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  profile: styleProfileSchema.optional(),
});

export const styleChatResponseSchema = z.object({
  assistant_message: z.string().min(1),
  ready: z.boolean(),
  profile: styleProfileSchema,
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type StyleProfile = z.infer<typeof styleProfileSchema>;
export type StyleChatRequest = z.infer<typeof styleChatRequestSchema>;
export type StyleChatResponse = z.infer<typeof styleChatResponseSchema>;
