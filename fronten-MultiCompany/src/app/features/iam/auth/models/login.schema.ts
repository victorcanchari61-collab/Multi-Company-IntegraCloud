import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  slug: z.string().optional(),
});

export type LoginFormValue = z.infer<typeof loginSchema>;
