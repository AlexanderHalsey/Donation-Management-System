import { PaginationDto } from './pagination.dto'
import { TaxReceiptListItemDto, TaxReceiptListSortOrder } from './taxReceipt.dto'

export class GetTaxReceiptListResponse {
  taxReceipts: TaxReceiptListItemDto[]
  pagination: PaginationDto<TaxReceiptListSortOrder>
}
