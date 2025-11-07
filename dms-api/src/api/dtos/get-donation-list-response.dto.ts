import { DonationDto } from './donation.dto'
import { PaginationDto } from './pagination.dto'
import { DonationSortOrder } from './sort-order.dto'

export class GetDonationListResponse {
  donations: DonationDto[]
  pagination: PaginationDto<DonationSortOrder>
}
