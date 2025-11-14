import type { DonorRef } from '@shared/models'

export const getDonorFullName = (donor: DonorRef): string =>
  `${donor.lastName.toUpperCase()}${donor.firstName ? ` ${donor.firstName}` : ''}`
