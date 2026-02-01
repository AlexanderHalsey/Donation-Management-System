import { EligibleTaxReceiptDonorDto } from './taxReceipt.dto'

export class GetEligibleTaxReceiptDonorsResponse {
  year: number
  organisationId: string
  eligibleDonors: EligibleTaxReceiptDonorDto[]
}
