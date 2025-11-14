import { NameSortOrder } from './sort-order.dto'

export class DonationTypeRefDto {
  id: string
  name: string
}

export class DonationTypeDto extends DonationTypeRefDto {
  createdAt: string
  updatedAt: string
  organisationId: string
}

export class DonationTypeRefSortOrder extends NameSortOrder {}
