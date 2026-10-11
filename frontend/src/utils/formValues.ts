import { z } from 'zod'

export const optionalNumber = (message: string, min: number, max?: number) =>
  z.string().refine(
    (value) => {
      if (value.trim() === '') return true
      const parsed = Number(value.replace(',', '.'))
      return !Number.isNaN(parsed) && parsed >= min && (max === undefined || parsed <= max)
    },
    { error: message },
  )

export const toText = (value: string) => (value.trim() === '' ? null : value.trim())

export const toNumber = (value: string) =>
  value.trim() === '' ? null : Number(value.replace(',', '.'))
