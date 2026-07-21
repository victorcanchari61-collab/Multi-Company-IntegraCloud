import { z } from 'zod';

export const roleFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(80),
  description: z.string().max(255).optional(),
});
