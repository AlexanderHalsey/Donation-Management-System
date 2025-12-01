import { NameSortOrder } from './sort-order.dto'

export class PaymentModeDto {
  id: string
  name: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

export class PaymentModeSortOrder extends NameSortOrder {}
