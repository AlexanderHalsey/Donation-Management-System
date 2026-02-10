import { TaxReceiptTemplate } from './base'
import { formatDate } from '@/domain/helpers'

export const cerfaTaxReceiptTemplate = {
  name: 'French Tax Receipt (CERFA)',
  locale: 'fr-FR',
  currency: {
    code: 'EUR',
    symbol: '€',
    formatOptions: { style: 'currency', currency: 'EUR' },
  },
  positions: {
    cerfa: {
      text: { x: 28, y: 33 },
      number: { x: 45, y: 51 },
    },
    receiptTitle: { x: 190, y: 28 },
    receiptSubtitle: { x: 190, y: 56 },
    receiptNumber: { x: 470, y: 28 },
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
      cerfa: {
        text: 'Selon modèle Cerfa',
        number: 'N° 11580-03',
      },
      titleText: 'Reçu de DONS aux Œuvres N° :',
      subtitleText: '(Articles 200 et 238 bis et 885-0 V bis A du Code Général des Impôts)',
    },
    labels: {
      organisationLabel: 'Bénéficiaire des versements :',
      donorLabel: 'Donateur :',
      organisationObjectLabel: (object: string) => `Objet : ${object}`,
      totalAmount: 'La somme totale de :',
      totalWords: 'Somme en toutes lettres :',
      paymentMethod: 'Mode de versement :',
      donationMethod: 'Forme du don :',
      donationAssetType: 'Nature du don :',
    },
    tableHeaders: {
      date: 'Date du Don',
      paymentMethod: 'Mode de Paiement',
      donationMethod: 'Forme du Don',
      donationAssetType: 'Nature du Don',
      amount: 'Montant',
    },
    templates: {
      recognitionTextIndividual: (date: Date) =>
        `L'association bénéficiaire reconnaît avoir reçu à titre de don le ${formatDate(date, 'fr-FR')}`,
      recognitionTextAnnual: (year: number) =>
        `L'association bénéficiaire reconnaît avoir reçu comme dons entre le 01/01/${year} et le 31/12/${year}`,
      taxCertification:
        "Le bénéficiaire certifie sur les dons et versements qu'il reçoit ouvrent droit à la réduction d'impôt prévue à l'article 200 du CGI, 238 bis du CGI, 885-0 V bis A.",
      taxCertificationLocation: (city: string) =>
        `A ${city} le : ${formatDate(new Date(), 'fr-FR')}`,
    },
  },
  cancelledWatermark: {
    imagePath: 'src/assets/watermarks/cancelled_fr.png',
    imageType: 'png',
    sizeFactor: 0.4,
  },
} as const satisfies TaxReceiptTemplate
