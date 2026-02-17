import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { GCSService } from '@/infrastructure'

import { PDFRendererService, PDF } from './pdfRenderer.service'

import {
  convertToWords,
  formatCurrency,
  formatDate,
  getDonationsTotalAmount,
  getDonorAddressLines,
} from '../helpers/taxReceiptGeneration'

import {
  cerfaTaxReceiptTemplate,
  demoTaxReceiptTemplate,
  TaxReceiptTemplate,
} from '@/domain/templates/taxReceiptGeneration'

import { Donor, TaxReceiptType } from '@generated/prisma/client'

import { TaxReceiptOrganisationInfo, TaxReceiptDonation } from '@/domain/types'

@Injectable()
export class TaxReceiptGeneratorService implements OnModuleInit {
  private template: TaxReceiptTemplate
  private cancelledWatermarkImageBuffer: Buffer

  constructor(
    private readonly pdfRenderer: PDFRendererService,
    private readonly configService: ConfigService,
    private readonly gcsService: GCSService,
  ) {}

  async onModuleInit() {
    const templates = [
      { name: 'cerfa', template: cerfaTaxReceiptTemplate },
      { name: 'demo', template: demoTaxReceiptTemplate },
    ]
    const templateName = this.configService.get<string>('TAX_RECEIPT_TEMPLATE')
    const template = templates.find((t) => t.name === templateName)?.template
    if (!template) {
      throw new Error(
        'Invalid TAX_RECEIPT_TEMPLATE environment variable. Must be "cerfa" or "demo".',
      )
    }
    this.template = template
    this.cancelledWatermarkImageBuffer = await this.gcsService.downloadFile(
      this.template.cancelledWatermark.storageKey,
    )
  }
  private addDonationSummaryLabelValue({
    y,
    label,
    value,
  }: {
    y: number
    label: string
    value: string
  }): number {
    this.pdfRenderer.addText({
      ...this.template.positions.donationSummaryLabels,
      ...this.template.layout.donationSummary,
      text: label,
      y,
    })
    return this.pdfRenderer.addText({
      ...this.template.positions.donationSummaryValues,
      ...this.template.layout.donationSummary,
      ...this.template.layout.donationSummaryValues,
      text: value,
      y,
    })
  }

  private createDonationTableRows(donations: TaxReceiptDonation[], y: number): number {
    const headers = this.template.content.tableHeaders

    this.pdfRenderer.addTable(
      PDF.MARGIN + PDF.PADDING + 1,
      y + 10,
      donations.map((donation) => ({
        [headers.date]: formatDate(donation.donatedAt, this.template.locale),
        [headers.paymentMethod]: donation.paymentMode.name,
        [headers.donationMethod]: donation.donationMethod.name,
        [headers.donationAssetType]: donation.donationAssetType.name,
        [headers.amount]: formatCurrency(
          donation.amount,
          this.template.locale,
          this.template.currency.code,
        ),
      })),
      [
        { key: headers.date, width: 117 },
        { key: headers.paymentMethod, width: 164 },
        { key: headers.donationMethod, width: 174 },
        { key: headers.donationAssetType, width: 154 },
        { key: headers.amount, width: 107 },
      ].map((header) => ({
        name: header.key,
        prompt: header.key,
        width: header.width,
        align: 'center' as const,
        padding: 0,
      })),
      this.template.styles.table,
    )
    return y + (donations.length + 1) * this.template.layout.donationTable.rowHeight + PDF.PADDING
  }

  private addTitleSection(taxReceiptNumber: number): number {
    const titleInformation: Parameters<typeof this.pdfRenderer.addText>[0][] = [
      {
        ...this.template.positions.receiptTitle,
        text: this.template.content.header.titleText,
        ...this.template.styles.title,
      },
      {
        ...this.template.positions.receiptSubtitle,
        text: this.template.content.header.subtitleText,
      },
      {
        ...this.template.positions.receiptNumber,
        text: `${taxReceiptNumber}`,
        ...this.template.styles.title,
      },
    ]

    // Add CERFA info only if present in template
    if (this.template.content.header.cerfa && this.template.positions.cerfa) {
      this.pdfRenderer.drawVerticalLine({
        x: PDF.MARGIN + 120,
        startY: PDF.MARGIN,
        endY: PDF.MARGIN + 60,
      })

      titleInformation.unshift(
        {
          ...this.template.positions.cerfa.text,
          text: this.template.content.header.cerfa.text,
        },
        {
          ...this.template.positions.cerfa.number,
          text: this.template.content.header.cerfa.number,
        },
      )
    }

    titleInformation.forEach((info) => this.pdfRenderer.addText(info))

    return PDF.MARGIN + PDF.TITLE_HEIGHT
  }

  private addOrganisationSection({
    startY,
    logo,
    title,
    streetAddress,
    postalCode,
    city,
  }: {
    startY: number
    logo: Buffer
    title: string
    streetAddress: string
    postalCode: string
    city: string
  }): number {
    return this.pdfRenderer.addSection({
      startY,
      title: this.template.content.labels.organisationLabel,
      cb: (y) => {
        this.pdfRenderer.addImage({
          buffer: logo,
          x: this.template.positions.logo.x,
          y,
          size: {
            width: this.template.layout.logo.width,
          },
        })
        y = this.pdfRenderer.addText({
          text: title,
          y: y + this.template.layout.orgInfo.paddingTop,
          x: this.template.positions.orgInfo.x,
          ...this.template.styles.bold,
        })
        return (
          this.pdfRenderer.addText({
            text: `${streetAddress}\n${postalCode} ${city}`,
            y: y + this.template.layout.orgInfo.paddingTop,
            x: this.template.positions.orgInfo.x,
          }) + this.template.layout.orgInfo.paddingBottom
        )
      },
    })
  }

  private addOrganisationObjectSection({
    startY,
    object,
    objectDescription,
  }: {
    startY: number
    object: string
    objectDescription: string
  }): number {
    return this.pdfRenderer.addSection({
      startY,
      title: this.template.content.labels.organisationObjectLabel(object),
      cb: (y) =>
        this.pdfRenderer.addText({
          text: objectDescription,
          y,
        }),
    })
  }

  private addDonorSection({ startY, donor }: { startY: number; donor: Donor }): number {
    return this.pdfRenderer.addSection({
      startY,
      title: this.template.content.labels.donorLabel,
      cb: (y) => {
        y = this.pdfRenderer.addText({
          text: `${donor.firstName ? `${donor.firstName} ` : ''}${donor.lastName}`,
          x: this.template.positions.donorInfo.x,
          y,
          ...this.template.styles.bold,
        })
        getDonorAddressLines(donor).forEach((line) => {
          y = this.pdfRenderer.addText({
            text: line,
            x: this.template.positions.donorInfo.x,
            y,
          })
        })
        return y
      },
    })
  }

  private addDonationSectionIndividual({
    startY,
    donation,
  }: {
    startY: number
    donation: TaxReceiptDonation
  }): number {
    return this.pdfRenderer.addSection({
      startY,
      cb: (y) => {
        y =
          this.pdfRenderer.addText({
            text: this.template.content.templates.recognitionTextIndividual(donation.donatedAt),
            y,
            lineHeightFactor: 1.6,
          }) + this.template.layout.recognitionText.paddingBottom
        ;[
          [
            this.template.content.labels.totalAmount,
            formatCurrency(donation.amount, this.template.locale, this.template.currency.code),
          ],
          [
            this.template.content.labels.totalWords,
            convertToWords(donation.amount, this.template.locale),
          ],
          [this.template.content.labels.paymentMethod, donation.paymentMode.name],
          [this.template.content.labels.donationMethod, donation.donationMethod.name],
          [this.template.content.labels.donationAssetType, donation.donationAssetType.name],
        ].forEach(([label, value]) => {
          y = this.addDonationSummaryLabelValue({ y, label, value })
        })
        return y
      },
    })
  }

  private addDonationSectionAnnual({
    startY,
    donations,
  }: {
    startY: number
    donations: TaxReceiptDonation[]
  }): number {
    return this.pdfRenderer.addSection({
      startY,
      cb: (y) => {
        y =
          this.pdfRenderer.addText({
            text: this.template.content.templates.recognitionTextAnnual(
              donations[0].donatedAt.getFullYear(),
            ),
            y,
            lineHeightFactor: 1.6,
          }) + this.template.layout.recognitionText.paddingBottom

        y = this.addDonationSummaryLabelValue({
          y,
          label: this.template.content.labels.totalAmount,
          value: formatCurrency(
            getDonationsTotalAmount(donations),
            this.template.locale,
            this.template.currency.code,
          ),
        })
        y = this.addDonationSummaryLabelValue({
          y,
          label: this.template.content.labels.totalWords,
          value: convertToWords(getDonationsTotalAmount(donations), this.template.locale),
        })

        const breakpointTableIndex =
          Math.floor(
            (PDF.PAGE_HEIGHT - PDF.MARGIN - y) / this.template.layout.donationTable.rowHeight,
          ) - 1
        const firstPageDonations = donations.slice(0, breakpointTableIndex)
        const remainingDonations = donations.slice(breakpointTableIndex)

        y = this.createDonationTableRows(firstPageDonations, y)
        if (remainingDonations.length > 0) {
          y = this.pdfRenderer.addPage()
          y = this.createDonationTableRows(remainingDonations, y)
        }
        return y
      },
    })
  }

  private addDonationSection({
    startY,
    donations,
    taxReceiptType,
  }: {
    startY: number
    donations: TaxReceiptDonation[]
    taxReceiptType: TaxReceiptType
  }): number {
    if (taxReceiptType === 'INDIVIDUAL') {
      return this.addDonationSectionIndividual({
        startY,
        donation: donations[0],
      })
    } else {
      return this.addDonationSectionAnnual({
        startY,
        donations,
      })
    }
  }

  private addSignatureSection({
    startY,
    signatoryName,
    signatoryPosition,
    signature,
    city,
  }: {
    startY: number
    signatoryName: string
    signatoryPosition: string
    signature: Buffer
    city: string
  }): number {
    return this.pdfRenderer.addSection({
      startY,
      cb: (y) => {
        y = this.pdfRenderer.addText({
          text: this.template.content.templates.taxCertification,
          y,
        })
        y =
          this.pdfRenderer.addText({
            text: this.template.content.templates.taxCertificationLocation(city),
            y: y + this.template.layout.signatureDate.paddingTop,
            ...this.template.positions.signatureDate,
          }) + this.template.layout.signatureDate.paddingBottom
        y = this.pdfRenderer.addText({
          text: signatoryName,
          y,
          ...this.template.positions.signatureArea,
          ...this.template.styles.bold,
        })
        y = this.pdfRenderer.addText({
          text: signatoryPosition,
          y,
          ...this.template.positions.signatureArea,
        })
        this.pdfRenderer.addImage({
          buffer: signature,
          ...this.template.positions.signature,
          y,
          size: {
            height: this.template.layout.signature.height,
          },
        })

        return y
      },
    })
  }

  async generateTaxReceipt({
    taxReceiptNumber,
    organisation,
    donor,
    donations,
    taxReceiptType,
  }: {
    taxReceiptNumber: number
    organisation: TaxReceiptOrganisationInfo
    donor: Donor
    donations: TaxReceiptDonation[]
    taxReceiptType: TaxReceiptType
  }): Promise<Buffer> {
    this.pdfRenderer.initialize({ unit: 'pt', format: 'a4' })

    let y = this.addTitleSection(taxReceiptNumber)

    y = this.addOrganisationSection({
      ...organisation,
      startY: y,
    })

    y = this.addOrganisationObjectSection({
      ...organisation,
      startY: y,
    })

    y = this.addDonorSection({ startY: y, donor })

    y = this.addDonationSection({
      startY: y,
      donations,
      taxReceiptType,
    })

    if (y + this.template.layout.signatureArea.minHeight > PDF.PAGE_HEIGHT - PDF.MARGIN) {
      y = this.pdfRenderer.addPage()
    }

    this.addSignatureSection({
      ...organisation,
      startY: y,
    })

    return this.pdfRenderer.output()
  }

  async cancelTaxReceipt(buffer: Buffer): Promise<Buffer> {
    return await this.pdfRenderer.addWatermarkImageToExistingPdf(
      buffer,
      this.cancelledWatermarkImageBuffer,
      this.template.cancelledWatermark.imageType,
      this.template.cancelledWatermark.sizeFactor,
    )
  }
}
