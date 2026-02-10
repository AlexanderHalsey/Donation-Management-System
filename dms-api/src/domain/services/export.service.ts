import { Injectable } from '@nestjs/common'

import * as Papa from 'papaparse'
import { Workbook } from 'exceljs'
import { capitalize } from 'es-toolkit'

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
import { isDate } from 'date-fns'

interface ExportHeaderTranslation {
  donation: { [K in keyof DonationExport]: string }
  donor: { [K in keyof DonorExport]: string }
}
type ExportType = keyof ExportHeaderTranslation

@Injectable()
export class ExportService {
  private readonly headerTranslations: Record<Language, ExportHeaderTranslation> = {
    fr: {
      donation: {
        lastName: 'Nom',
        firstName: 'Prénom',
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

  private exportXlsx(language: Language, exportType: ExportType, data: unknown[]): Workbook {
    const headers = this.getLocalizedHeaders(exportType, language)

    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet(capitalize(exportType))

    worksheet.columns = headers
    worksheet.addRows(data)
    worksheet.columns.forEach((column) => {
      let maxColumnLength = 0
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        maxColumnLength = Math.max(
          maxColumnLength,
          8,
          cell.value ? (isDate(cell.value) ? 10 : cell.value.toString().length) : 0,
        )
      })
      column.width = maxColumnLength + 2
    })

    return workbook
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private exportCsv(language: Language, exportType: ExportType, data: any[]): string {
    const headers = this.getLocalizedHeaders(exportType, language)
    return Papa.unparse(
      data.map((item) =>
        headers.reduce((acc, { key, header }) => ({ ...acc, [header]: item[key] }), {}),
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
    return this.exportCsv(language, 'donation', donations)
  }

  async exportDonationListXlsx(
    language: Language,
    orderBy: DonationListSortOrder,
    filter?: DonationListFilter,
  ) {
    const donations = await this.donationService.getExportList(orderBy, language, filter)
    return this.exportXlsx(language, 'donation', donations)
  }

  async exportDonorListCsv(
    language: Language,
    orderBy: DonorListSortOrder,
    filter?: DonorListFilter,
  ) {
    const donors = await this.donorService.getExportList(orderBy, filter)
    return this.exportCsv(language, 'donor', donors)
  }

  async exportDonorListXlsx(
    language: Language,
    orderBy: DonorListSortOrder,
    filter?: DonorListFilter,
  ) {
    const donors = await this.donorService.getExportList(orderBy, filter)
    return this.exportXlsx(language, 'donor', donors)
  }
}
