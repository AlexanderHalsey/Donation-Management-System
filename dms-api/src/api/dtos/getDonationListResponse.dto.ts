import { DonationListItemDto, DonationListSortOrder } from './donation.dto'
import { PaginationDto } from './pagination.dto'

export class GetDonationListResponse {
  donations: DonationListItemDto[]
  pagination: PaginationDto<DonationListSortOrder>
}
