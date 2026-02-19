import { Injectable, Logger } from '@nestjs/common'

import * as Papa from 'papaparse'
import { format, isDate } from 'date-fns'

import { DonationService } from './donation.service'
import { DonorService } from './donor.service'

import {
  DonationListFilter,
  DonationListSortOrder,
  DonorListFilter,
  DonorListSortOrder,
} from '@shared/models'

import { Language } from '@/domain/types'
import { DonationExport, DonorExport } from '@shared/models'

interface ExportHeaderTranslation {
  donation: { [K in keyof DonationExport]: string }
  donor: { [K in keyof DonorExport]: string }
}
type ExportType = keyof ExportHeaderTranslation

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name)
  private readonly headerTranslations: Record<Language, ExportHeaderTranslation> = {
    fr: {
      donation: {
        lastName: 'Nom',
        firstName: 'Prénom',
        email: 'Email',
        externalId: 'ID Externe',
        donatedAt: 'Date du don',
        amount: 'Montant',
        paymentMode: 'Mode de Paiement',
        donationType: 'Type de don',
        organisation: 'Organisation',
        donationMethod: 'Forme du don',
        donationAssetType: 'Nature du Don',
        taxReceiptNumber: 'Reçu Fiscal °',
        taxReceiptType: 'Type de reçu',
        taxReceiptStatus: 'Statut de reçu',
      },
      donor: {
        externalId: 'ID Externe',
        lastName: 'Nom',
        firstName: 'Prénom',
        email: 'Email',
        donationTotalAmount: 'Montant total',
        donationCount: 'Total de dons',
      },
    },
    en: {
      donation: {
        lastName: 'Last Name',
        firstName: 'First Name',
        email: 'Email',
        externalId: 'External ID',
        donatedAt: 'Donation Date',
        amount: 'Amount',
        paymentMode: 'Payment Mode',
        donationType: 'Donation Type',
        organisation: 'Organisation',
        donationMethod: 'Donation Method',
        donationAssetType: 'Donation Asset Type',
        taxReceiptNumber: 'Tax Receipt No.',
        taxReceiptType: 'Tax Receipt Type',
        taxReceiptStatus: 'Tax Receipt Status',
      },
      donor: {
        externalId: 'External ID',
        lastName: 'Last Name',
        firstName: 'First Name',
        email: 'Email',
        donationTotalAmount: 'Total Donated',
        donationCount: 'Total Donations',
      },
    },
  }

  constructor(
    private readonly donationService: DonationService,
    private readonly donorService: DonorService,
  ) {}

  private getLocalizedHeaders(type: ExportType, language: Language) {
    const translations = this.headerTranslations[language][type]
    return Object.entries(translations).map(([key, header]) => ({ key, header }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private exportCsv(language: Language, exportType: ExportType, data: any[]): string {
    const headers = this.getLocalizedHeaders(exportType, language)
    return Papa.unparse(
      data.map((item) =>
        headers.reduce(
          (acc, { key, header }) => ({
            ...acc,
            [header]: isDate(item[key]) ? format(item[key], 'yyyy-MM-dd') : item[key],
          }),
          {},
        ),
      ),
      { columns: headers.map((h) => h.header) },
    )
  }

  async exportDonationListCsv(
    language: Language,
    orderBy: DonationListSortOrder,
    filter?: DonationListFilter,
  ) {
    const donations = await this.donationService.getExportList(orderBy, language, filter)
    const csv = this.exportCsv(language, 'donation', donations)
    this.logger.log(`Generated CSV for donation list with ${donations.length} rows`)
    return csv
  }

  async exportDonorListCsv(
    language: Language,
    orderBy: DonorListSortOrder,
    filter?: DonorListFilter,
  ) {
    const donors = await this.donorService.getExportList(orderBy, filter)
    const csv = this.exportCsv(language, 'donor', donors)
    this.logger.log(`Generated CSV for donor list with ${donors.length} rows`)
    return csv
  }
}
