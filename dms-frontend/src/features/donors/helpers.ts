import type { DonorSummary } from '@shared/models'

export const getDonorFullName = (donor: DonorSummary): string =>
  `${donor.lastName.toUpperCase()}${donor.firstName ? ` ${donor.firstName}` : ''}`
