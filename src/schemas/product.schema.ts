import { z } from "zod";

const productBaseSchema = z.object({
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
      .min(1, "El precio de compra es requerido")
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
         message: "El precio de compra debe ser un número positivo"
      }),

   sale_price: z
      .string()
      .min(1, "El precio de venta es requerido")
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
         message: "El precio de venta debe ser un número positivo"
      }),

   stock: z
      .string()
      .min(1, "El stock es requerido")
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number.isInteger(Number(val)), {
         message: "El stock debe ser un número entero positivo"
      }),

   image: z
      .any()
      .optional()
      .refine((files) => {
         if (!files) return true;
         const file = Array.isArray(files) ? files[0] : (files instanceof FileList ? files[0] : files);
         if (!file) return true;
         return file.size <= 5 * 1024 * 1024; // 5MB
      }, "La imagen no puede superar 5MB")
      .refine((files) => {
         if (!files) return true;
         const file = Array.isArray(files) ? files[0] : (files instanceof FileList ? files[0] : files);
         if (!file) return true;
         const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
         return validTypes.includes(file.type);
      }, "Solo se permiten imágenes JPG, PNG o WEBP")
});

export const productSchema = productBaseSchema.refine(
   (data) => {
      const purchasePrice = Number(data.purchase_price);
      const salePrice = Number(data.sale_price);
      return salePrice > purchasePrice;
   },
   {
      message: "El precio de venta debe ser mayor al precio de compra",
      path: ["sale_price"]
   }
);

export type ProductFormData = z.infer<typeof productSchema>;