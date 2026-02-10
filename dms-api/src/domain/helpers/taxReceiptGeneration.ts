import { capitalize } from 'es-toolkit'
import { ToWords } from 'to-words'
import { format } from 'date-fns'
import { fr, enGB } from 'date-fns/locale'

import { Donation, Donor } from '@generated/prisma/client'

export function getDonationsTotalAmount(donations: Donation[]): number {
  return donations.reduce((sum, donation) => sum + donation.amount, 0)
}

export function formatCurrency(amount: number, locale: string, currency: string): string {
  return (
    Intl.NumberFormat(locale, { style: 'currency', currency })
      .format(amount)
      // eslint-disable-next-line no-irregular-whitespace
      .replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g, ' ')
  )
}

export function convertToWords(amount: number, locale: string): string {
  const converter = new ToWords({
    localeCode: locale,
    converterOptions: { currency: true, ignoreDecimal: false, ignoreZeroCurrency: false },
  })

  if (locale.startsWith('fr')) {
    return capitalize(converter.convert(amount).toLowerCase())
  }

  return converter.convert(amount)
}

export function formatDate(date: Date, locale: string): string {
  const localeMap = {
    'fr-FR': { locale: fr, format: 'dd/MM/yyyy' },
    'en-GB': { locale: enGB, format: 'dd/MM/yyyy' },
  }

  const config = localeMap[locale] || localeMap['fr-FR']
  return format(date, config.format, { locale: config.locale })
}

export function getDonorAddressLines(donor: Donor): string[] {
  const donorAddress: string[] = []
  if (donor.careOf || donor.streetAddress1) {
    donorAddress.push([donor.careOf, donor.streetAddress1].filter(Boolean).join(', '))
  }
  if (donor.streetAddress2) {
    donorAddress.push(donor.streetAddress2)
  }
  if (donor.postalCode) {
    const formattedDonorLocations = [donor.city, donor.state].filter(Boolean).join('\n')
    donorAddress.push(
      `${donor.postalCode}${formattedDonorLocations ? ` ${formattedDonorLocations}` : ''}`,
    )
  } else if (donor.city || donor.state) {
    donorAddress.push([donor.city, donor.state].filter(Boolean).join(', '))
  }
  return donorAddress
}
