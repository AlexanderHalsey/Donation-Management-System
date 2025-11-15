import { DonorListItemDto, DonorListSortOrder } from './donor.dto'
import { PaginationDto } from './pagination.dto'

export class GetDonorListResponse {
  donors: DonorListItemDto[]
  pagination: PaginationDto<DonorListSortOrder>
}
