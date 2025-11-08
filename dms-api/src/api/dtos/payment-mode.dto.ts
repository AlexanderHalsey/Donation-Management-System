import { NameSortOrder } from './sort-order.dto'

export class PaymentModeDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
}

export class PaymentModeListSortOrder extends NameSortOrder {}
