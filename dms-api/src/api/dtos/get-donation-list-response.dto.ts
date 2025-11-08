import { DonationDto, DonationListSortOrder } from './donation.dto'
import { PaginationDto } from './pagination.dto'

export class GetDonationListResponse {
  donations: DonationDto[]
  pagination: PaginationDto<DonationListSortOrder>
}
