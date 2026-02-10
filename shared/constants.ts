import type { TaxReceiptStatus } from './models'

export const getTaxReceiptStatusOptions = (
  locale: 'fr' | 'en',
): {
  id: TaxReceiptStatus
  name: string
  icon: string
  color: string
}[] =>
  [
    {
      id: 'PENDING',
      name: locale === 'fr' ? 'En attente de génération' : 'Pending generation',
      icon: 'hourglass_empty',
      color: 'blue',
    },
    {
      id: 'PROCESSING',
      name: locale === 'fr' ? 'En cours de génération' : 'Processing',
      icon: 'autorenew',
      color: 'amber',
    },
    {
      id: 'COMPLETED',
      name: locale === 'fr' ? 'Généré' : 'Completed',
      icon: 'check_circle',
      color: 'green',
    },
    {
      id: 'CANCELED',
      name: locale === 'fr' ? 'Annulé' : 'Canceled',
      icon: 'cancel',
      color: 'grey',
    },
    { id: 'FAILED', name: locale === 'fr' ? 'Échoué' : 'Failed', icon: 'error', color: 'red' },
  ] as const
