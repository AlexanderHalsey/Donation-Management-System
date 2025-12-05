import { PaginationDto } from './pagination.dto'
import { TaxReceiptListItemDto, TaxReceiptListSortOrder } from './tax-receipt.dto'

export class GetTaxReceiptListResponse {
  taxReceipts: TaxReceiptListItemDto[]
  pagination: PaginationDto<TaxReceiptListSortOrder>
}
