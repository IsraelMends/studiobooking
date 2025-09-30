import { z } from "zod";

export const RegisterSchema = z.object({
  full_name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  organization_id: z.string().uuid("Selecione uma organização válida"),
});

export type RegisterForm = z.infer<typeof RegisterSchema>;