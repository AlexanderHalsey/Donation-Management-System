export class GetEligibleTaxReceiptYearOrganisationsResponse {
  yearOrganisationPairs: {
    year: number
    isReleased: boolean
    organisationId: string
  }[]
  releaseDate: string
}
