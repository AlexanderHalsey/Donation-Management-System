export interface DonationMethodRef {
  id: string
  name: string
}

export interface DonationMethod extends DonationMethodRef {
  createdAt: Date
  updatedAt: Date
  isDefault: boolean
}
