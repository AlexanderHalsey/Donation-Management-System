import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'

import * as Papa from 'papaparse'
import { Workbook, Worksheet } from 'exceljs'

import { ExportService } from '../services/export.service'
import { DonationService } from '../services/donation.service'
import { DonorService } from '../services/donor.service'

import {
  DonationListFilter,
  DonationListSortOrder,
  DonorListFilter,
  DonorListSortOrder,
  DonationExport,
  DonorExport,
} from '@shared/models'

jest.mock('papaparse')
jest.mock('exceljs')

describe('ExportService', () => {
  const mockDonationService = mockDeep<DonationService>()
  const mockDonorService = mockDeep<DonorService>()
  const mockWorkbook = mockDeep<Workbook>()
  const mockWorksheet = mockDeep<Worksheet>()

  let exportService: ExportService

  const mockDonationData: DonationExport[] = [
    {
      lastName: 'Doe',
      firstName: 'John',
      donatedAt: new Date('2023-01-01'),
      amount: 100,
      paymentMode: 'Credit Card',
      donationType: 'Regular',
      organisation: 'Test Org',
      donationMethod: 'Online',
      donationAssetType: 'Money',
      taxReceiptNumber: 12345,
      taxReceiptType: 'Annual',
      taxReceiptStatus: 'Issued',
    },
    {
      lastName: 'Smith',
      firstName: 'Jane',
      donatedAt: new Date('2023-01-02'),
      amount: 200,
      paymentMode: 'Bank Transfer',
      donationType: 'Special',
      organisation: 'Test Org',
      donationMethod: 'Mail',
      donationAssetType: 'Goods',
      taxReceiptNumber: 12346,
      taxReceiptType: 'Quarterly',
      taxReceiptStatus: 'Pending',
    },
  ]

  const mockDonorData: DonorExport[] = [
    {
      lastName: 'Doe',
      firstName: 'John',
      email: 'john.doe@example.com',
      donationCount: 5,
      donationTotalAmount: 500,
    },
    {
      lastName: 'Smith',
      firstName: 'Jane',
      email: 'jane.smith@example.com',
      donationCount: 3,
      donationTotalAmount: 300,
    },
  ]

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(mockDonationService)
    mockReset(mockDonorService)
    mockReset(mockWorkbook)
    mockReset(mockWorksheet)

    // Mock Workbook constructor and methods
    ;(Workbook as jest.MockedClass<typeof Workbook>).mockImplementation(() => mockWorkbook)
    mockWorkbook.addWorksheet.mockReturnValue(mockWorksheet)

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        ExportService,
        {
          provide: DonationService,
          useValue: mockDonationService,
        },
        {
          provide: DonorService,
          useValue: mockDonorService,
        },
      ],
    }).compile()

    exportService = app.get<ExportService>(ExportService)
  })

  describe('exportDonationListCsv', () => {
    it('should export donation list as CSV in English', async () => {
      const orderBy: DonationListSortOrder = { donatedAt: 'desc' }
      const filter: DonationListFilter = { amount: { gte: 100 } }
      const expectedCsv = 'lastName,firstName,donatedAt,amount\nDoe,John,2023-01-01,100'

      mockDonationService.getExportList.mockResolvedValue(mockDonationData)
      ;(Papa.unparse as jest.Mock).mockReturnValue(expectedCsv)

      const result = await exportService.exportDonationListCsv('en', orderBy, filter)

      expect(mockDonationService.getExportList).toHaveBeenCalledWith(orderBy, 'en', filter)
      expect(Papa.unparse).toHaveBeenCalledWith(
        mockDonationData.map((donation) => ({
          'Last Name': donation.lastName,
          'First Name': donation.firstName,
          'Donation Date': donation.donatedAt,
          Amount: donation.amount,
          'Payment Mode': donation.paymentMode,
          'Donation Type': donation.donationType,
          Organisation: donation.organisation,
          'Donation Method': donation.donationMethod,
          'Donation Asset Type': donation.donationAssetType,
          'Tax Receipt No.': donation.taxReceiptNumber,
          'Tax Receipt Type': donation.taxReceiptType,
          'Tax Receipt Status': donation.taxReceiptStatus,
        })),
        {
          columns: [
            'Last Name',
            'First Name',
            'Donation Date',
            'Amount',
            'Payment Mode',
            'Donation Type',
            'Organisation',
            'Donation Method',
            'Donation Asset Type',
            'Tax Receipt No.',
            'Tax Receipt Type',
            'Tax Receipt Status',
          ],
        },
      )
      expect(result).toBe(expectedCsv)
    })

    it('should export donation list as CSV in French', async () => {
      const orderBy: DonationListSortOrder = { donatedAt: 'desc' }
      const expectedCsv = 'lastName,firstName,donatedAt,amount\nDoe,John,2023-01-01,100'

      mockDonationService.getExportList.mockResolvedValue(mockDonationData)
      ;(Papa.unparse as jest.Mock).mockReturnValue(expectedCsv)

      const result = await exportService.exportDonationListCsv('fr', orderBy)

      expect(mockDonationService.getExportList).toHaveBeenCalledWith(orderBy, 'fr', undefined)
      expect(Papa.unparse).toHaveBeenCalledWith(
        mockDonationData.map((donation) => ({
          Nom: donation.lastName,
          Prénom: donation.firstName,
          'Date du don': donation.donatedAt,
          Montant: donation.amount,
          'Mode de Paiement': donation.paymentMode,
          'Type de don': donation.donationType,
          Organisation: donation.organisation,
          'Forme du don': donation.donationMethod,
          'Nature du Don': donation.donationAssetType,
          'Reçu Fiscal °': donation.taxReceiptNumber,
          'Type de reçu': donation.taxReceiptType,
          'Statut de reçu': donation.taxReceiptStatus,
        })),
        {
          columns: [
            'Nom',
            'Prénom',
            'Date du don',
            'Montant',
            'Mode de Paiement',
            'Type de don',
            'Organisation',
            'Forme du don',
            'Nature du Don',
            'Reçu Fiscal °',
            'Type de reçu',
            'Statut de reçu',
          ],
        },
      )
      expect(result).toBe(expectedCsv)
    })
  })

  describe('exportDonationListXlsx', () => {
    it('should export donation list as XLSX in English', async () => {
      const orderBy: DonationListSortOrder = { donatedAt: 'desc' }
      const filter: DonationListFilter = { amount: { gte: 100 } }

      mockDonationService.getExportList.mockResolvedValue(mockDonationData)

      const result = await exportService.exportDonationListXlsx('en', orderBy, filter)

      expect(mockDonationService.getExportList).toHaveBeenCalledWith(orderBy, 'en', filter)
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Donation')
      expect(mockWorksheet.columns).toBeDefined()
      expect(mockWorksheet.addRows).toHaveBeenCalledWith(mockDonationData)
      expect(result).toBe(mockWorkbook)
    })

    it('should export donation list as XLSX in French', async () => {
      const orderBy: DonationListSortOrder = { donatedAt: 'desc' }

      mockDonationService.getExportList.mockResolvedValue(mockDonationData)

      const result = await exportService.exportDonationListXlsx('fr', orderBy)

      expect(mockDonationService.getExportList).toHaveBeenCalledWith(orderBy, 'fr', undefined)
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Donation')
      expect(mockWorksheet.columns).toBeDefined()
      expect(mockWorksheet.addRows).toHaveBeenCalledWith(mockDonationData)
      expect(result).toBe(mockWorkbook)
    })
  })

  describe('exportDonorListCsv', () => {
    it('should export donor list as CSV in English', async () => {
      const orderBy: DonorListSortOrder = { lastName: 'asc' }
      const filter: DonorListFilter = { totalAmount: { gte: 100 } }
      const expectedCsv =
        'Last Name,First Name,Email,Total Donations,Total Donated\nDoe,John,john.doe@example.com,5,500'

      mockDonorService.getExportList.mockResolvedValue(mockDonorData)
      ;(Papa.unparse as jest.Mock).mockReturnValue(expectedCsv)

      const result = await exportService.exportDonorListCsv('en', orderBy, filter)

      expect(mockDonorService.getExportList).toHaveBeenCalledWith(orderBy, filter)
      expect(Papa.unparse).toHaveBeenCalledWith(
        mockDonorData.map((donor) => ({
          'Last Name': donor.lastName,
          'First Name': donor.firstName,
          Email: donor.email,
          'Total Donated': donor.donationTotalAmount,
          'Total Donations': donor.donationCount,
        })),
        {
          columns: ['Last Name', 'First Name', 'Email', 'Total Donated', 'Total Donations'],
        },
      )
      expect(result).toBe(expectedCsv)
    })

    it('should export donor list as CSV in French', async () => {
      const orderBy: DonorListSortOrder = { lastName: 'asc' }
      const expectedCsv =
        'Nom,Prénom,Email,Total de dons,Montant total\nDoe,John,john.doe@example.com,5,500'

      mockDonorService.getExportList.mockResolvedValue(mockDonorData)
      ;(Papa.unparse as jest.Mock).mockReturnValue(expectedCsv)

      const result = await exportService.exportDonorListCsv('fr', orderBy)

      expect(mockDonorService.getExportList).toHaveBeenCalledWith(orderBy, undefined)
      expect(Papa.unparse).toHaveBeenCalledWith(
        mockDonorData.map((donor) => ({
          Nom: donor.lastName,
          Prénom: donor.firstName,
          Email: donor.email,
          'Montant total': donor.donationTotalAmount,
          'Total de dons': donor.donationCount,
        })),
        {
          columns: ['Nom', 'Prénom', 'Email', 'Montant total', 'Total de dons'],
        },
      )
      expect(result).toBe(expectedCsv)
    })
  })

  describe('exportDonorListXlsx', () => {
    it('should export donor list as XLSX in English', async () => {
      const orderBy: DonorListSortOrder = { lastName: 'asc' }
      const filter: DonorListFilter = { totalAmount: { gte: 100 } }

      mockDonorService.getExportList.mockResolvedValue(mockDonorData)

      const result = await exportService.exportDonorListXlsx('en', orderBy, filter)

      expect(mockDonorService.getExportList).toHaveBeenCalledWith(orderBy, filter)
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Donor')
      expect(mockWorksheet.columns).toBeDefined()
      expect(mockWorksheet.addRows).toHaveBeenCalledWith(mockDonorData)
      expect(result).toBe(mockWorkbook)
    })

    it('should export donor list as XLSX in French', async () => {
      const orderBy: DonorListSortOrder = { lastName: 'asc' }

      mockDonorService.getExportList.mockResolvedValue(mockDonorData)

      const result = await exportService.exportDonorListXlsx('fr', orderBy)

      expect(mockDonorService.getExportList).toHaveBeenCalledWith(orderBy, undefined)
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Donor')
      expect(mockWorksheet.columns).toBeDefined()
      expect(mockWorksheet.addRows).toHaveBeenCalledWith(mockDonorData)
      expect(result).toBe(mockWorkbook)
    })
  })
})
