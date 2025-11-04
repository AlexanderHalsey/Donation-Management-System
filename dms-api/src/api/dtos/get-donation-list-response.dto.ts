import { DonationDto } from './donation.dto'
import { PaginationDto } from './pagination.dto'

export class GetDonationListResponse {
  donationList: DonationDto[]
  pagination: PaginationDto
}
