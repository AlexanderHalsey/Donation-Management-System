import type { DonorRef } from '@shared/models'

export const getDonorFullName = (donor: DonorRef, withDisabledSign = true): string =>
  `${withDisabledSign && donor.isDisabled ? '🚫 ' : ''}${donor.lastName.toUpperCase()}${donor.firstName ? ` ${donor.firstName}` : ''}`
