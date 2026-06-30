import { z } from 'zod'

/** Los campos numéricos se manejan como string en el form y se convierten al enviar. */
const priceField = z
  .string()
  .optional()
  .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Número inválido (≥ 0)')

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(2000).optional(),
  code: z.string().optional(),
  autoCode: z.boolean().optional(),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  isActive: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  subbrandId: z.string().optional(),
  unitOfMeasureId: z.string().optional(),
  salePrice: priceField,
  costPrice: priceField,
  ticketDescription: z.string().max(500).optional(),
  stockMin: z.string().optional(),
  stockMax: z.string().optional(),
  loteNumber: z.string().optional(),
  loteExpiry: z.string().optional(),
  loteStock: z.string().optional(),
  loteStockFraction: z.string().optional(),
  technicalAction: z.string().max(2000).optional(),
  priceRows: z
    .array(
      z.object({
        id: z.string().optional(),
        formatoVenta: z.string().optional(),
        factor: z.string().optional(),
        unitOfMeasureId: z.string().optional(),
        productoC: z.string().optional(),
        complementaryProductId: z.string().optional(),
        cantidadC: z.string().optional(),
        precioCompra: z.string().optional(),
        porcentajeVenta: z.string().optional(),
      }),
    )
    .optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
