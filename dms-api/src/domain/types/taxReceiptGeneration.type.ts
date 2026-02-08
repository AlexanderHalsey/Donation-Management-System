import {
  Donation,
  DonationAssetType,
  DonationMethod,
  Donor,
  PaymentMode,
  TaxReceiptType,
} from '@generated/prisma/client'

export type TaxReceiptDonation = Donation & {
  paymentMode: PaymentMode
  donationMethod: DonationMethod
  donationAssetType: DonationAssetType
}

export interface TaxReceiptOptions {
  taxReceiptNumber: number
  organisation: TaxReceiptOrganisationInfo
  donor: Donor
  donations: TaxReceiptDonation[]
  taxReceiptType: TaxReceiptType
}

export interface TaxReceiptOrganisationInfo {
  title: string
  streetAddress: string
  postalCode: string
  city: string
  object: string
  objectDescription: string
  signatoryName: string
  signatoryPosition: string
  logo: Buffer
  signature: Buffer
}
