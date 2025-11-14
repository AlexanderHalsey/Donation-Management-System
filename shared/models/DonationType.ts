export interface DonationTypeRef {
  id: string
  name: string
}

export interface DonationType extends DonationTypeRef {
  createdAt: Date
  updatedAt: Date
  organisationId: string
}
