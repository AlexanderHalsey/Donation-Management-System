import type { DonationListItem } from '@shared/models'

// order here is important, first predicate to match takes precedence for donation list table
export const DONATION_STATUS_OPTIONS = [
  {
    className: 'bg-red-3',
    label: 'Dons supprimés',
    predicate: (row: DonationListItem) => row.isDisabled,
  },
  {
    className: 'bg-green-3',
    label: 'Dons avec reçu',
    predicate: (row: DonationListItem) => !!row.taxReceiptId,
  },
] as const satisfies {
  className: string
  label: string
  predicate: (row: DonationListItem) => boolean
}[]
