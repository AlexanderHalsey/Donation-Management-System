import { z } from 'zod'

import { AddressSchema } from './address.schema'
import { EmailSchema } from './email.schema'

const AbstractProfileSchema = z.object({
  id: z.number(),
  salutation: z.string(),
  name: z.string(),
  email: EmailSchema.optional(),
  alternativeEmail: EmailSchema.optional(),
  primaryAddress: AddressSchema.optional(),
})

export const TransformedProfileSchema = z.object({
  externalId: z.number(),
  civility: z.string(),
  lastName: z.string(),
  firstName: z.string().optional(),
  email: EmailSchema.optional(),
  phoneNumber: z.string().optional(),
  careOf: z.string().optional(),
  streetAddress1: z.string().optional(),
  streetAddress2: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  isFacilitator: z.boolean(),
})

const transformAbstractProfile = (
  data: z.infer<typeof AbstractProfileSchema>,
): z.infer<typeof TransformedProfileSchema> => ({
  externalId: data.id,
  civility: data.salutation,
  lastName: data.name,
  firstName: undefined,
  email: data.email || undefined,
  careOf: data.primaryAddress?.careOf,
  streetAddress1: data.primaryAddress?.streetAddress,
  streetAddress2: data.primaryAddress?.streetAddress2,
  postalCode: data.primaryAddress?.zipCode,
  city: data.primaryAddress?.city,
  state: data.primaryAddress?.province,
  country: data.primaryAddress?.country,
  isFacilitator: false,
})

const OrganisationProfileSchema = AbstractProfileSchema.extend({
  objectType: z.literal('ORGANISATION'),
}).transform(transformAbstractProfile)

const PersonProfileSchema = AbstractProfileSchema.extend({
  objectType: z.literal('PERSON'),
  firstName: z.string(),
  lastName: z.string(),
  privatePhoneNumber: z.string(),
  alternativePhoneNumber: z.string(),
  preferredEmail: z.union([z.literal('PRIVATE'), z.literal('ALTERNATIVE')]),
  preferredPhoneNumber: z.union([z.literal('PRIVATE'), z.literal('ALTERNATIVE')]),
  isFacilitator: z.boolean().optional(),
}).transform((data) => ({
  ...transformAbstractProfile(data),
  firstName: data.firstName || undefined,
  lastName: data.lastName,
  email:
    data.preferredEmail === 'PRIVATE'
      ? data.email || undefined
      : data.alternativeEmail || undefined,
  phoneNumber:
    data.preferredPhoneNumber === 'PRIVATE'
      ? data.privatePhoneNumber || undefined
      : data.alternativePhoneNumber || undefined,
  isFacilitator: data.isFacilitator || false,
}))

export const ProfileSchema = z.discriminatedUnion('objectType', [
  PersonProfileSchema,
  OrganisationProfileSchema,
])

export const MergedProfileSchema = z
  .array(
    z.intersection(
      ProfileSchema,
      z.object({
        mergeStatus: z.union([z.literal('MERGED'), z.literal('DELETED')]),
      }),
    ),
  )
  .length(2)
  .superRefine((data, ctx) => {
    if (!data.some((p) => p.mergeStatus === 'MERGED')) {
      ctx.addIssue({
        code: 'custom',
        message: 'One of the profiles must have mergeStatus "MERGED"',
      })
    }
  })

export const TransformedMergedProfileSchema = z
  .array(
    z.intersection(
      TransformedProfileSchema,
      z.object({
        mergeStatus: z.union([z.literal('MERGED'), z.literal('DELETED')]),
      }),
    ),
  )
  .length(2)
  .superRefine((data, ctx) => {
    if (!data.some((p) => p.mergeStatus === 'MERGED')) {
      ctx.addIssue({
        code: 'custom',
        message: 'One of the profiles must have mergeStatus "MERGED"',
      })
    }
  })
