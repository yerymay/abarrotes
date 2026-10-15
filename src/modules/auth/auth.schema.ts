import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().default(""),
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
};

function parseOrThrow<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Datos inválidos");
  }
  return result.data;
}

export const parseRegister = (data: unknown): RegisterInput => parseOrThrow(registerSchema, data);
export const parseLogin = (data: unknown): LoginInput => parseOrThrow(loginSchema, data);
