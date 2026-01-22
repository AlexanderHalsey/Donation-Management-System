import z from 'zod'

export const EmailSchema = z.preprocess(
  (val) =>
    typeof val === 'string'
      ? val
          .trim()
          .replace(/\s+/g, '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      : val,
  z.union([z.email().catch(''), z.literal('')]),
)
