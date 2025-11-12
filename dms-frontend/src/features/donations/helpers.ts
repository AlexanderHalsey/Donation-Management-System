import type { Donation } from '@shared/models'

// order here is important, first predicate to match takes precedence for donation list table
export const DONATION_STATUS_OPTIONS = [
  { className: 'bg-red-3', label: 'Dons supprimés', predicate: (row: Donation) => row.isDisabled },
  {
    className: 'bg-green-3',
    label: 'Dons avec reçu',
    predicate: (row: Donation) => !!row.receiptId,
  },
] as const satisfies { className: string; label: string; predicate: (row: Donation) => boolean }[]
