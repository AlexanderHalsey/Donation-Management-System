import { DonorCreateManyInput } from '../generated/prisma/models'

import * as UserListJson from './user-list.json'

export const buildMockDonorCreateManyInput = (index: number): DonorCreateManyInput => {
  const userItem = UserListJson[index % UserListJson.length]
  return {
    externalId: index + 1,
    civility: index % 2 === 0 ? 'Mr' : 'Ms',
    isFacilitator: index % 50 === 49,
    isDisabled: index % 20 === 19,
    ...userItem,
  }
}
