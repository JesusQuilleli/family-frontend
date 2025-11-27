import { z } from "zod";

export const categorySchema = z.object({
   name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;