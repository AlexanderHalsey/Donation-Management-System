type Actions = {
  collapseAll: string
  confirmAnnualReceiptCreation: string
  confirmDeletion: string
  confirmTaxReceiptCancellation: string
  create: string
  createAnnualReceipts: string
  delete: string
  donatorSelected: string
  edit: string
  expandAll: string
  generateReceipt: string
  goToProfile: string
  new: string
  retry: string
  showCancellation: string
  update: string
}

type Common = {
  active: string
  cancel: string
  close: string
  confirm: string
  creation: string
  disabled: string
  english: string
  filters: string
  french: string
  help: string
  language: string
  loading: string
  login: string
  logout: string
  name: string
  no: string
  optional: string
  required: string
  reset: string
  summary: string
  year: string
  yes: string
}

type Errors = {
  atLeastOneDonorMustBeSelected: string
  donationAssetTypeAlreadyExists: string
  donationMethodAlreadyExists: string
  donationTypeAlreadyExists: string
  donationTypeNotInOrganisation: string
  fileUpload: string
  greaterThanTo: string
  incorrectCredentials: string
  invalidDate: string
  lessThanFrom: string
  organisationAlreadyExists: string
  paymentModeAlreadyExists: string
}

type Labels = {
  address: string
  amount: string
  annualReceiptCreationTooltip: string
  annualTaxReceiptsBeingCreated: string
  averageDonationAmount: string
  cancellationReason: string
  cancelledTaxReceipt: string
  city: string
  civility: string
  country: string
  createAnnualTaxReceipts: string
  creationDate: string
  defaultValue: string
  disabledDonor: string
  disabledDonors: string
  disabledDonorsTooltip: string
  disabledDonorsWithDonations: string
  donatedAt: string
  donationAssetTypeDefaultDescription: string
  donationFilters: string
  donationMethodDefaultDescription: string
  donationsChartTitle: string
  donationsEligibleForTaxReceipt: string
  donationsOfWeek: string
  donationsWithTaxReceipt: string
  donorFilters: string
  eligibleForTaxReceipts: string
  email: string
  exportsRespectFilters: string
  externalId: string
  failedTaxReceipt: string
  fileName: string
  firstName: string
  fullName: string
  groupBy: string
  lastName: string
  lastUpdate: string
  listOfDonationAssetTypes: string
  listOfDonationMethods: string
  listOfDonationTypes: string
  listOfDonations: string
  listOfDonors: string
  listOfOrganisations: string
  listOfPaymentModes: string
  listOfTaxReceipts: string
  newDonation: string
  newDonationAssetType: string
  newDonationMethod: string
  newDonationType: string
  newDonor: string
  newOrganisation: string
  newPaymentMode: string
  numberOfDonations: string
  password: string
  phoneNumber: string
  postalCode: string
  receiptNumber: string
  receiptStatus: string
  receiptType: string
  state: string
  streetAddress1: string
  streetAddress2: string
  taxReceiptFilters: string
  taxReceiptIsBeingGenerated: string
  taxReceiptsFailedTooltip: string
  taxReceiptsStatus: string
  thisMonth: string
  thisYear: string
  topDonors: string
  totalAllTime: string
  totalAmount: string
  totalDonationAmount: string
  totalReceiptsToSendByEmail: string
  totalTaxReceiptsToCreate: string
  updateDonation: string
  updateDonationAssetType: string
  updateDonationMethod: string
  updateDonationType: string
  updateDonor: string
  updateOrganisation: string
  updatePaymentMode: string
  username: string
  value: string
}

type Nouns = {
  annual: string
  annualTaxReceipt: string
  donation: string
  donationAssetType: string
  donationMade: string
  donationMethod: string
  donationStatistics: string
  donationType: string
  donor: string
  facilitator: string
  individual: string
  individualTaxReceipt: string
  internalName: string
  logo: string
  object: string
  objectDescription: string
  organisation: string
  paymentMode: string
  personalInformation: string
  signature: string
  signatoryName: string
  signatoryPosition: string
  status: string
  taxReceipt: string
  taxReceiptName: string
}

type Notifications = {
  annualTaxReceiptsInCreationProcess: string
  donationAssetTypeCreated: string
  donationAssetTypeDeleted: string
  donationAssetTypeUpdated: string
  donationCreated: string
  donationDeleted: string
  donationMethodCreated: string
  donationMethodDeleted: string
  donationMethodUpdated: string
  donationTypeCreated: string
  donationTypeDeleted: string
  donationTypeUpdated: string
  donationUpdated: string
  donorCreated: string
  donorDeleted: string
  donorUpdated: string
  organisationCreated: string
  organisationDeleted: string
  organisationUpdated: string
  paymentModeCreated: string
  paymentModeDeleted: string
  paymentModeUpdated: string
  taxReceiptIsBeingGenerated: string
}

type Pages = {
  dashboard: string
  forbidden: string
  notFound: string
}

type Placeholders = {
  cancellationReasonHint: string
  datePlaceholder: string
  noAddressProvided: string
  noOptionsFound: string
  noTableResults: string
  thisDonatorHasNoEmail: string
}

type Prepositions = {
  after: string
  by: string
  from: string
  to: string
}

type Questions = {
  sureToCancelTaxReceipt: string
  sureToCreateAnnualTaxReceipts: string
  sureToDeleteDonation: string
  sureToDeleteDonationAssetType: string
  sureToDeleteDonationMethod: string
  sureToDeleteDonationType: string
  sureToDeleteOrganisation: string
  sureToDeletePaymentMode: string
}

export type Translations = {
  actions: Actions
  common: Common
  errors: Errors
  labels: Labels
  nouns: Nouns
  notifications: Notifications
  pages: Pages
  placeholders: Placeholders
  prepositions: Prepositions
  questions: Questions
}
