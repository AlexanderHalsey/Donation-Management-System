import { NameSortOrder } from './sort-order.dto'

export class PaymentModeRefDto {
  id: string
  name: string
}

export class PaymentModeDto {
  createdAt: string
  updatedAt: string
}

export class PaymentModeRefSortOrder extends NameSortOrder {}
