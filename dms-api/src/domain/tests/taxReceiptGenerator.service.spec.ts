import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'
import * as fs from 'fs'
import * as path from 'path'

import { TaxReceiptGeneratorService } from '../services/taxReceiptGenerator.service'
import { ConfigService } from '@nestjs/config'
import { PDFRendererService } from '../services/pdfRenderer.service'
import { demoTaxReceiptTemplate, cerfaTaxReceiptTemplate } from '../templates/taxReceiptGeneration'

import type { TaxReceiptOrganisationInfo, TaxReceiptDonation } from '../types'
import type { Donor, TaxReceiptType } from '@generated/prisma/client'

jest.mock('fs')
jest.mock('path')

describe('TaxReceiptGeneratorService', () => {
  const mockPDFRenderer = mockDeep<PDFRendererService>()
  const mockConfigService = mockDeep<ConfigService>({
    get: (key: string) => {
      if (key === 'TAX_RECEIPT_TEMPLATE') return 'demo'
      return undefined
    },
  })

  const mockOrganisation = mockDeep<TaxReceiptOrganisationInfo>({
    title: 'Association Test',
    streetAddress: '123 Rue de la Paix',
    postalCode: '75001',
    city: 'Paris',
    object: 'Aide humanitaire',
    objectDescription: "Organisme d'aide humanitaire international",
    signatoryName: 'Jean Dupont',
    signatoryPosition: 'Président',
    logo: Buffer.from('logo'),
    signature: Buffer.from('signature'),
  })

  const mockDonor = mockDeep<Donor>({
    id: 'donor-1',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    phoneNumber: null,
    streetAddress1: '456 Avenue des Champs',
    postalCode: '75008',
    city: 'Paris',
    country: 'France',
    isDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const mockDonation = mockDeep<TaxReceiptDonation>({
    id: 'donation-1',
    amount: 100,
    donatedAt: new Date('2023-12-25'),
    donorId: 'donor-1',
    organisationId: 'org-1',
    donationMethodId: 'method-1',
    donationAssetTypeId: 'asset-1',
    donationTypeId: 'type-1',
    paymentModeId: 'payment-1',
    taxReceiptId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentMode: {
      id: 'payment-1',
      name: 'Virement bancaire',
      isDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    donationMethod: {
      id: 'method-1',
      name: 'En ligne',
      isDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    donationAssetType: {
      id: 'asset-1',
      name: 'Argent',
      isDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  let taxReceiptGeneratorService: TaxReceiptGeneratorService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockReset(mockPDFRenderer)
    mockReset(mockConfigService)

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        TaxReceiptGeneratorService,
        { provide: PDFRendererService, useValue: mockPDFRenderer },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    taxReceiptGeneratorService = app.get<TaxReceiptGeneratorService>(TaxReceiptGeneratorService)
  })

  describe('selectTemplateForEnvironment', () => {
    it('should select correct template based on environment variable', () => {
      const service1 = new TaxReceiptGeneratorService(
        mockPDFRenderer,
        mockDeep<ConfigService>({
          get: (key: string) => {
            if (key === 'TAX_RECEIPT_TEMPLATE') return 'cerfa'
            return undefined
          },
        }),
      )
      expect(service1['selectTemplateForEnvironment']()).toEqual(cerfaTaxReceiptTemplate)

      const service2 = new TaxReceiptGeneratorService(
        mockPDFRenderer,
        mockDeep<ConfigService>({
          get: (key: string) => {
            if (key === 'TAX_RECEIPT_TEMPLATE') return 'demo'
            return undefined
          },
        }),
      )
      expect(service2['selectTemplateForEnvironment']()).toEqual(demoTaxReceiptTemplate)
    })

    it('should throw error for invalid template', () => {
      expect(
        () =>
          new TaxReceiptGeneratorService(
            mockPDFRenderer,
            mockDeep<ConfigService>({
              get: (key: string) => {
                if (key === 'TAX_RECEIPT_TEMPLATE') return 'invalid'
                return undefined
              },
            }),
          ),
      ).toThrow('Invalid TAX_RECEIPT_TEMPLATE environment variable. Must be "cerfa" or "demo".')
    })
  })

  describe('addDonationSummaryLabelValue', () => {
    it('should add label and value text with correct positioning', () => {
      mockPDFRenderer.addText.mockReturnValue(100)

      const result = taxReceiptGeneratorService['addDonationSummaryLabelValue']({
        y: 100,
        label: 'Total Amount:',
        value: '$150.00',
      })

      expect(mockPDFRenderer.addText).toHaveBeenCalledTimes(2)
      expect(mockPDFRenderer.addText).toHaveBeenNthCalledWith(1, {
        ...demoTaxReceiptTemplate.positions.donationSummaryLabels,
        ...demoTaxReceiptTemplate.layout.donationSummary,
        text: 'Total Amount:',
        y: 100,
      })
      expect(result).toBe(100)
    })
  })

  describe('createDonationTableRows', () => {
    it('should create table with formatted donation data', () => {
      const donations = [mockDonation, { ...mockDonation, id: 'donation-2', amount: 200 }]

      const result = taxReceiptGeneratorService['createDonationTableRows'](donations, 100)

      expect(mockPDFRenderer.addTable).toHaveBeenCalledWith(
        expect.any(Number),
        110, // y + 10
        expect.arrayContaining([
          expect.objectContaining({
            [demoTaxReceiptTemplate.content.tableHeaders.paymentMethod]: 'Virement bancaire',
            [demoTaxReceiptTemplate.content.tableHeaders.amount]: expect.any(String),
          }),
        ]),
        expect.any(Array),
        demoTaxReceiptTemplate.styles.table,
      )

      const expectedY =
        100 + (donations.length + 1) * demoTaxReceiptTemplate.layout.donationTable.rowHeight + 10
      expect(result).toBe(expectedY)
    })
  })

  describe('addTitleSection', () => {
    it('should add title information without CERFA', () => {
      taxReceiptGeneratorService['addTitleSection'](12345)

      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: demoTaxReceiptTemplate.content.header.titleText,
          ...demoTaxReceiptTemplate.positions.receiptTitle,
          ...demoTaxReceiptTemplate.styles.title,
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: demoTaxReceiptTemplate.content.header.subtitleText,
          ...demoTaxReceiptTemplate.positions.receiptSubtitle,
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '12345',
          ...demoTaxReceiptTemplate.positions.receiptNumber,
          ...demoTaxReceiptTemplate.styles.title,
        }),
      )
      expect(mockPDFRenderer.drawVerticalLine).not.toHaveBeenCalled()
    })

    it('should add CERFA information when present in template', () => {
      const serviceWithCerfa = new TaxReceiptGeneratorService(mockPDFRenderer, mockConfigService)
      serviceWithCerfa['template'] = {
        ...demoTaxReceiptTemplate,
        content: {
          ...demoTaxReceiptTemplate.content,
          header: {
            ...demoTaxReceiptTemplate.content.header,
            cerfa: { text: 'Cerfa N°', number: '11580*03' },
          },
        },
        positions: {
          ...demoTaxReceiptTemplate.positions,
          cerfa: { text: { x: 30, y: 20 }, number: { x: 30, y: 35 } },
        },
      }

      serviceWithCerfa['addTitleSection'](12345)

      expect(mockPDFRenderer.drawVerticalLine).toHaveBeenCalledWith({
        x: expect.any(Number),
        startY: expect.any(Number),
        endY: expect.any(Number),
      })
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Cerfa N°' }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({ text: '11580*03' }),
      )
    })
  })

  describe('addOrganisationSection', () => {
    it('should add organisation information with logo and address', () => {
      const orgData = {
        startY: 100,
        logo: Buffer.from('logo-data'),
        title: 'Test Organisation',
        streetAddress: '123 Test Street',
        postalCode: '12345',
        city: 'Test City',
      }

      mockPDFRenderer.addSection.mockImplementation(({ cb }) => cb(50))
      mockPDFRenderer.addText.mockReturnValue(60)

      taxReceiptGeneratorService['addOrganisationSection'](orgData)

      expect(mockPDFRenderer.addSection).toHaveBeenCalledWith({
        startY: 100,
        title: demoTaxReceiptTemplate.content.labels.organizationLabel,
        cb: expect.any(Function),
      })
      expect(mockPDFRenderer.addImage).toHaveBeenCalledWith({
        buffer: orgData.logo,
        x: demoTaxReceiptTemplate.positions.logo.x,
        y: 50,
        size: { width: demoTaxReceiptTemplate.layout.logo.width },
      })
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Test Organisation',
          x: demoTaxReceiptTemplate.positions.orgInfo.x,
          ...demoTaxReceiptTemplate.styles.bold,
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '123 Test Street\n12345 Test City',
          x: demoTaxReceiptTemplate.positions.orgInfo.x,
        }),
      )
    })
  })

  describe('addOrganisationObjectSection', () => {
    it('should add organisation object information', () => {
      const objectData = {
        startY: 200,
        object: 'Humanitarian Aid',
        objectDescription: 'International humanitarian aid organization',
      }

      mockPDFRenderer.addSection.mockImplementation(({ cb }) => cb(50))

      taxReceiptGeneratorService['addOrganisationObjectSection'](objectData)

      expect(mockPDFRenderer.addSection).toHaveBeenCalled()
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith({
        text: 'International humanitarian aid organization',
        y: 50,
      })
    })
  })

  describe('addDonorSection', () => {
    it('should add donor information with name and address', () => {
      mockPDFRenderer.addSection.mockImplementation(({ cb }) => cb(50))
      mockPDFRenderer.addText.mockReturnValue(60)

      taxReceiptGeneratorService['addDonorSection']({ startY: 300, donor: mockDonor })

      expect(mockPDFRenderer.addSection).toHaveBeenCalledWith({
        startY: 300,
        title: demoTaxReceiptTemplate.content.labels.donorLabel,
        cb: expect.any(Function),
      })
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: `${mockDonor.firstName} ${mockDonor.lastName}`,
          x: demoTaxReceiptTemplate.positions.donorInfo.x,
          ...demoTaxReceiptTemplate.styles.bold,
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(mockDonor.streetAddress1 || ''),
          x: demoTaxReceiptTemplate.positions.donorInfo.x,
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(`${mockDonor.postalCode} ${mockDonor.city}`),
          x: demoTaxReceiptTemplate.positions.donorInfo.x,
        }),
      )
    })
  })

  describe('addDonationSectionIndividual', () => {
    it('should add individual donation information with summary', () => {
      mockPDFRenderer.addSection.mockImplementation(({ cb }) => cb(50))
      taxReceiptGeneratorService['addDonationSummaryLabelValue'] = jest.fn().mockReturnValue(60)

      taxReceiptGeneratorService['addDonationSectionIndividual']({
        startY: 400,
        donation: mockDonation,
      })

      expect(mockPDFRenderer.addSection).toHaveBeenCalled()
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({ lineHeightFactor: 1.6 }),
      )
      expect(taxReceiptGeneratorService['addDonationSummaryLabelValue']).toHaveBeenCalledTimes(5)
    })
  })

  describe('addDonationSectionAnnual', () => {
    it('should add annual donation information and handle page breaks', () => {
      const donations = Array.from({ length: 50 }, (_, i) => ({
        ...mockDonation,
        id: `donation-${i}`,
        amount: 100,
      }))

      mockPDFRenderer.addSection.mockImplementation(({ cb }) => cb(50))
      mockPDFRenderer.addText.mockReturnValue(60)
      mockPDFRenderer.addPage.mockReturnValue(50)
      taxReceiptGeneratorService['addDonationSummaryLabelValue'] = jest.fn().mockReturnValue(60)
      taxReceiptGeneratorService['createDonationTableRows'] = jest.fn().mockReturnValue(800)

      taxReceiptGeneratorService['addDonationSectionAnnual']({
        startY: 500,
        donations,
      })

      expect(mockPDFRenderer.addSection).toHaveBeenCalledWith({
        startY: 500,
        cb: expect.any(Function),
      })
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('2023'),
          lineHeightFactor: 1.6,
        }),
      )
      expect(taxReceiptGeneratorService['addDonationSummaryLabelValue']).toHaveBeenCalledWith({
        y: expect.any(Number),
        label: demoTaxReceiptTemplate.content.labels.totalAmount,
        value: expect.stringContaining('$5,000.00'), // 50 * 100
      })
      expect(taxReceiptGeneratorService['createDonationTableRows']).toHaveBeenCalledTimes(2)
      expect(mockPDFRenderer.addPage).toHaveBeenCalled()
    })
  })

  describe('addDonationSection', () => {
    it('should delegate to INDIVIDUAL method with correct parameters', () => {
      taxReceiptGeneratorService['addDonationSectionIndividual'] = jest.fn().mockReturnValue(200)

      const result = taxReceiptGeneratorService['addDonationSection']({
        startY: 100,
        donations: [mockDonation],
        taxReceiptType: 'INDIVIDUAL' as TaxReceiptType,
      })

      expect(taxReceiptGeneratorService['addDonationSectionIndividual']).toHaveBeenCalledWith({
        startY: 100,
        donation: mockDonation,
      })
      expect(result).toBe(200)
    })

    it('should delegate to ANNUAL method with correct parameters', () => {
      taxReceiptGeneratorService['addDonationSectionAnnual'] = jest.fn().mockReturnValue(300)

      const result = taxReceiptGeneratorService['addDonationSection']({
        startY: 100,
        donations: [mockDonation],
        taxReceiptType: 'ANNUAL' as TaxReceiptType,
      })

      expect(taxReceiptGeneratorService['addDonationSectionAnnual']).toHaveBeenCalledWith({
        startY: 100,
        donations: [mockDonation],
      })
      expect(result).toBe(300)
    })
  })

  describe('addSignatureSection', () => {
    it('should add signature information with tax certification', () => {
      const signatureData = {
        startY: 600,
        signatoryName: 'John Doe',
        signatoryPosition: 'President',
        signature: Buffer.from('signature-data'),
        city: 'New York',
      }

      mockPDFRenderer.addSection.mockImplementation(({ cb }) => cb(50))
      mockPDFRenderer.addText.mockReturnValue(60)

      taxReceiptGeneratorService['addSignatureSection'](signatureData)

      expect(mockPDFRenderer.addSection).toHaveBeenCalledWith({
        startY: 600,
        cb: expect.any(Function),
      })
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: demoTaxReceiptTemplate.content.templates.taxCertification,
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringMatching(/New York, \d{2}\/\d{2}\/\d{4}/),
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'John Doe',
          ...demoTaxReceiptTemplate.styles.bold,
        }),
      )
      expect(mockPDFRenderer.addText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'President',
        }),
      )
      expect(mockPDFRenderer.addImage).toHaveBeenCalledWith(
        expect.objectContaining({ buffer: signatureData.signature }),
      )
    })
  })

  describe('generateTaxReceipt', () => {
    const commonParams = {
      taxReceiptNumber: 12345,
      organisation: mockOrganisation,
      donor: mockDonor,
      donations: [mockDonation],
    }

    it('should generate individual tax receipt successfully', async () => {
      // Mock private methods directly
      taxReceiptGeneratorService['addTitleSection'] = jest.fn().mockReturnValue(80)
      taxReceiptGeneratorService['addOrganisationSection'] = jest.fn().mockReturnValue(150)
      taxReceiptGeneratorService['addOrganisationObjectSection'] = jest.fn().mockReturnValue(200)
      taxReceiptGeneratorService['addDonorSection'] = jest.fn().mockReturnValue(300)
      taxReceiptGeneratorService['addDonationSection'] = jest.fn().mockReturnValue(400)
      taxReceiptGeneratorService['addSignatureSection'] = jest.fn()

      mockPDFRenderer.output.mockReturnValue(Buffer.from('pdf-buffer'))

      const result = await taxReceiptGeneratorService.generateTaxReceipt({
        ...commonParams,
        taxReceiptType: 'INDIVIDUAL' as TaxReceiptType,
      })

      expect(mockPDFRenderer.initialize).toHaveBeenCalledWith({ unit: 'pt', format: 'a4' })
      expect(taxReceiptGeneratorService['addTitleSection']).toHaveBeenCalledWith(12345)
      expect(taxReceiptGeneratorService['addOrganisationSection']).toHaveBeenCalledWith(
        expect.objectContaining({
          logo: mockOrganisation.logo,
          title: mockOrganisation.title,
          startY: 80,
        }),
      )
      expect(taxReceiptGeneratorService['addOrganisationObjectSection']).toHaveBeenCalledWith(
        expect.objectContaining({
          object: mockOrganisation.object,
          objectDescription: mockOrganisation.objectDescription,
          startY: 150,
        }),
      )
      expect(taxReceiptGeneratorService['addDonorSection']).toHaveBeenCalledWith(
        expect.objectContaining({
          donor: mockDonor,
          startY: 200,
        }),
      )
      expect(taxReceiptGeneratorService['addDonationSection']).toHaveBeenCalledWith(
        expect.objectContaining({
          donations: [mockDonation],
          taxReceiptType: 'INDIVIDUAL',
          startY: 300,
        }),
      )
      expect(taxReceiptGeneratorService['addSignatureSection']).toHaveBeenCalledWith(
        expect.objectContaining({
          signatoryName: mockOrganisation.signatoryName,
          signatoryPosition: mockOrganisation.signatoryPosition,
          signature: mockOrganisation.signature,
          city: mockOrganisation.city,
          startY: 400,
        }),
      )
      expect(mockPDFRenderer.output).toHaveBeenCalled()
      expect(result).toEqual(Buffer.from('pdf-buffer'))
    })

    it('should generate annual tax receipt with multiple donations', async () => {
      taxReceiptGeneratorService['addDonationSection'] = jest.fn().mockReturnValue(400)

      mockPDFRenderer.output.mockReturnValue(Buffer.from('pdf-buffer'))

      const annualDonations = [
        { ...mockDonation, id: 'donation-1', donatedAt: new Date('2023-06-15') },
        { ...mockDonation, id: 'donation-2', donatedAt: new Date('2023-12-25') },
      ]

      const result = await taxReceiptGeneratorService.generateTaxReceipt({
        ...commonParams,
        donations: annualDonations,
        taxReceiptType: 'ANNUAL' as TaxReceiptType,
      })

      expect(mockPDFRenderer.initialize).toHaveBeenCalledWith({ unit: 'pt', format: 'a4' })
      expect(taxReceiptGeneratorService['addDonationSection']).toHaveBeenCalledWith(
        expect.objectContaining({
          donations: annualDonations,
          taxReceiptType: 'ANNUAL',
        }),
      )
      expect(result).toEqual(Buffer.from('pdf-buffer'))
    })
  })

  describe('cancelTaxReceipt', () => {
    const mockFs = fs as jest.Mocked<typeof fs>
    const mockPath = path as jest.Mocked<typeof path>

    beforeEach(() => {
      mockPath.join.mockReturnValue('/mocked/path/cancelled.png')
      mockFs.readFileSync.mockReturnValue(Buffer.from('cancelled-watermark'))
      mockPDFRenderer.addWatermarkImageToExistingPdf.mockResolvedValue(Buffer.from('cancelled-pdf'))
    })

    it('should add cancelled watermark to PDF', async () => {
      const originalBuffer = Buffer.from('original-pdf')

      const result = await taxReceiptGeneratorService.cancelTaxReceipt(originalBuffer)

      expect(mockPath.join).toHaveBeenCalledWith(
        process.cwd(),
        demoTaxReceiptTemplate.cancelledWatermark.imagePath,
      )
      expect(mockFs.readFileSync).toHaveBeenCalled()
      expect(mockPDFRenderer.addWatermarkImageToExistingPdf).toHaveBeenCalledWith(
        originalBuffer,
        Buffer.from('cancelled-watermark'),
        demoTaxReceiptTemplate.cancelledWatermark.imageType,
        demoTaxReceiptTemplate.cancelledWatermark.sizeFactor,
      )
      expect(result).toEqual(Buffer.from('cancelled-pdf'))
    })
  })
})
