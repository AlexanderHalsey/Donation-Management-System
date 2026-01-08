export interface TaxReceiptTemplate {
  name: string
  locale: string
  currency: {
    code: string
    symbol: string
    formatOptions: Intl.NumberFormatOptions
  }
  positions: {
    cerfa?: {
      text: { x: number; y: number }
      number: { x: number; y: number }
    }
    receiptTitle: { x: number; y: number }
    receiptSubtitle: { x: number; y: number }
    receiptNumber: { x: number; y: number }
    logo: { x: number }
    orgInfo: { x: number }
    donorInfo: { x: number }
    donationSummaryLabels: { x: number }
    donationSummaryValues: { x: number }
    signatureDate: { x: number }
    signatureArea: { x: number }
    signature: { x: number }
  }
  styles: {
    title: { fontSize: number; fontStyle: 'bold' | 'italic' | 'normal' }
    bold: { fontStyle: 'bold' | 'italic' | 'normal' }
    table: {
      fontSize: number
      headerBackgroundColor: string
    }
  }
  layout: {
    logo: { width: number }
    orgInfo: { paddingTop: number; paddingBottom: number }
    recognitionText: { paddingBottom: number }
    donationSummary: { lineHeightFactor: number }
    donationSummaryValues: { fontStyle: 'bold' | 'italic' | 'normal' }
    signatureDate: { paddingTop: number; paddingBottom: number }
    signatureArea: { minHeight: number }
    signature: { height: number }
    donationTable: { rowHeight: number }
  }
  content: {
    header: {
      cerfa?: {
        text: string
        number: string
      }
      titleText: string
      subtitleText: string
    }
    labels: {
      organizationLabel: string
      donorLabel: string
      organizationObjectLabel: (object: string) => string
      totalAmount: string
      totalWords: string
      paymentMethod: string
      donationMethod: string
      donationAssetType: string
    }
    tableHeaders: {
      date: string
      paymentMethod: string
      donationMethod: string
      donationAssetType: string
      amount: string
    }
    templates: {
      recognitionTextIndividual: (date: Date) => string
      recognitionTextAnnual: (year: number) => string
      taxCertification: string
      taxCertificationLocation: (locality: string) => string
    }
  }
  cancelledWatermark: {
    imagePath: string
    imageType: 'png' | 'jpg'
    sizeFactor: number
  }
}
