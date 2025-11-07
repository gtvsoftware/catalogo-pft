import { z } from 'zod'

const priceRegex = /^\d+(,\d{2})$/

const normalizePrice = (val: string) => {
  let normalized = val.trim()

  normalized = normalized.replace('.', ',')

  if (!normalized.includes(',')) {
    normalized += ',00'
  } else if (/^\d+,\d$/.test(normalized)) {
    normalized += '0'
  }

  return normalized
}

const priceSchema = z
  .string()
  .optional()
  .transform(val => (val ? normalizePrice(val) : val))
  .refine(
    val => {
      if (!val || val.trim() === '') return true
      return priceRegex.test(val) && Number(val.replace(',', '.')) > 0
    },
    { message: 'Preço inválido' }
  )

export const itemFormSchema = z.object({
  id: z.string(),
  image: z.string().min(1, 'Imagem é obrigatória'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: priceSchema,
  discountPrice: priceSchema
})

export type itemFormType = z.infer<typeof itemFormSchema>
