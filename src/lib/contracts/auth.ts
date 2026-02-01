import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Campo obrigatorio")
  .max(50, "Maximo de 50 caracteres");

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: z
    .string()
    .trim()
    .email("Email invalido")
    .max(255, "Maximo de 255 caracteres"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(72, "Senha muito longa"),
  acceptTerms: z
    .boolean()
    .refine((value) => value, "Voce precisa aceitar os termos"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email invalido")
    .max(255, "Maximo de 255 caracteres"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(72, "Senha muito longa"),
  remember: z.boolean().optional().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
