import { TaxReceiptTemplate } from './base'
import { formatDate } from '@/domain/helpers'

export const demoTaxReceiptTemplate = {
  name: 'English Donation Receipt (Demo)',
  locale: 'en-US',
  currency: {
    code: 'USD',
    symbol: '$',
    formatOptions: { style: 'currency', currency: 'USD' },
  },
  positions: {
    receiptTitle: { x: 130, y: 28 },
    receiptSubtitle: { x: 190, y: 56 },
    receiptNumber: { x: 425, y: 28 },
    logo: { x: 93 },
    orgInfo: { x: 190 },
    donorInfo: { x: 190 },
    donationSummaryLabels: { x: 50 },
    donationSummaryValues: { x: 190 },
    signatureDate: { x: 50 },
    signatureArea: { x: 367 },
    signature: { x: 367 },
  },
  styles: {
    title: { fontSize: 18, fontStyle: 'bold' },
    bold: { fontStyle: 'bold' },
    table: {
      fontSize: 9,
      headerBackgroundColor: '#eeeeee',
    },
  },
  layout: {
    logo: { width: 60 },
    orgInfo: { paddingTop: 5, paddingBottom: 10 },
    recognitionText: { paddingBottom: 10 },
    donationSummary: { lineHeightFactor: 1.6 },
    donationSummaryValues: { fontStyle: 'italic' },
    signatureDate: { paddingTop: 15, paddingBottom: 10 },
    signatureArea: { minHeight: 165 },
    signature: { height: 50 },
    donationTable: { rowHeight: 17 },
  },
  content: {
    header: {
      titleText: 'Tax-Deductible Donation Receipt:',
      subtitleText: '(For tax purposes - This is a demo receipt)',
    },
    labels: {
      organizationLabel: 'Organization:',
      donorLabel: 'Donor:',
      organizationObjectLabel: (object: string) => `Purpose: ${object}`,
      totalAmount: 'Total Amount:',
      totalWords: 'Amount in Words:',
      paymentMethod: 'Payment Method:',
      donationMethod: 'Donation Method:',
      donationAssetType: 'Donation Asset Type:',
    },
    tableHeaders: {
      date: 'Date',
      paymentMethod: 'Payment Method',
      donationAssetType: 'Donation Asset Type',
      donationMethod: 'Donation Method',
      amount: 'Amount',
    },
    templates: {
      recognitionTextIndividual: (date: Date) =>
        `The organization acknowledges receipt of a donation on ${formatDate(date, 'en-US')}`,
      recognitionTextAnnual: (year: number) =>
        `The organization acknowledges receipt of donations between January 1, ${year} and December 31, ${year}`,
      taxCertification:
        'The organization certifies that this donation qualifies for tax-deductible status under applicable tax regulations. No goods or services were provided in exchange for this donation.',
      taxCertificationLocation: (city: string) => `${city}, ${formatDate(new Date(), 'en-US')}`,
    },
  },
  cancelledWatermark: {
    imagePath: 'src/assets/watermarks/cancelled_en.png',
    imageType: 'png',
    sizeFactor: 0.25,
  },
} as const satisfies TaxReceiptTemplate
