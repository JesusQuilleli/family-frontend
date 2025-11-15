import { z } from "zod";

export const productSchema = z.object({
   name: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres"),

   description: z
      .string()
      .min(10, "La descripción debe tener al menos 10 caracteres")
      .max(500, "La descripción no puede exceder 500 caracteres"),

   category_id: z
      .string()
      .min(1, "Debes seleccionar una categoría"),

   purchase_price: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
         message: "El precio de compra debe ser un número positivo"
      })
      .transform((val) => Number(val)),

   sale_price: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
         message: "El precio de venta debe ser un número positivo"
      })
      .transform((val) => Number(val)),

   stock: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
         message: "El stock debe ser un número positivo"
      })
      .transform((val) => Number(val)),

   image: z
      .instanceof(FileList)
      .optional()
      .refine((files) => {
         if (!files || files.length === 0) return true;
         return files[0]?.size <= 5 * 1024 * 1024; // 5MB
      }, "La imagen no puede superar 5MB")
      .refine((files) => {
         if (!files || files.length === 0) return true;
         const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
         return validTypes.includes(files[0]?.type);
      }, "Solo se permiten imágenes JPG, PNG o WEBP")
}).refine((data) => data.sale_price > data.purchase_price, {
   message: "El precio de venta debe ser mayor al precio de compra",
   path: ["sale_price"]
});

export type ProductFormData = z.infer<typeof productSchema>;