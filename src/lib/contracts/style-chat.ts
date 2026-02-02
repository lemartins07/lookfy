import { z } from "zod";
import { styleProfileSchema, type StyleProfile } from "@/lib/contracts/style-profile";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
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
export type StyleChatRequest = z.infer<typeof styleChatRequestSchema>;
export type StyleChatResponse = z.infer<typeof styleChatResponseSchema>;
