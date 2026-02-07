import type { TaxReceiptStatus } from './models'

export const TAX_RECEIPT_STATUS_OPTIONS: {
  id: TaxReceiptStatus
  name: string
  icon: string
  color: string
}[] = [
  { id: 'PENDING', name: 'En attente de génération', icon: 'hourglass_empty', color: 'blue' },
  {
    id: 'PROCESSING',
    name: 'En cours de génération',
    icon: 'autorenew',
    color: 'amber',
  },
  { id: 'COMPLETED', name: 'Généré', icon: 'check_circle', color: 'green' },
  { id: 'CANCELED', name: 'Annulé', icon: 'cancel', color: 'grey' },
  { id: 'FAILED', name: 'Échoué', icon: 'error', color: 'red' },
] as const
