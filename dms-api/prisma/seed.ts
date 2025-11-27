import 'dotenv/config'
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import {
  buildMockDonationAssetTypeCreateManyInput,
  buildMockDonationCreateManyInput,
  buildMockDonationMethodCreateManyInput,
  buildMockDonationTypeCreateManyInput,
  buildMockDonorCreateManyInput,
  buildMockOrganisationCreateManyInput,
  buildMockPaymentModeCreateManyInput,
} from './mocks'

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
})

async function main() {
  const organisations = await prisma.organisation.createManyAndReturn({
    data: new Array(3).fill(null).map((_, index) => buildMockOrganisationCreateManyInput(index)),
  })

  const paymentModes = await prisma.paymentMode.createManyAndReturn({
    select: { id: true },
    data: new Array(6).fill(null).map((_, index) => buildMockPaymentModeCreateManyInput(index)),
  })

  const donationTypes = await prisma.donationType.createManyAndReturn({
    select: { id: true },
    data: new Array(9).fill(null).map((_, index) =>
      buildMockDonationTypeCreateManyInput({
        index,
        organisation: organisations[index % organisations.length],
      }),
    ),
  })

  const donationMethods = await prisma.donationMethod.createManyAndReturn({
    select: { id: true },
    data: new Array(3).fill(null).map((_, index) => buildMockDonationMethodCreateManyInput(index)),
  })

  const donationAssetTypes = await prisma.donationAssetType.createManyAndReturn({
    select: { id: true },
    data: new Array(3)
      .fill(null)
      .map((_, index) => buildMockDonationAssetTypeCreateManyInput(index)),
  })

  const donors = await prisma.donor.createManyAndReturn({
    select: { id: true },
    data: new Array(300).fill(null).map((_, index) => buildMockDonorCreateManyInput(index)),
  })

  await prisma.donation.createMany({
    data: new Array(1000).fill(null).map((_, index) =>
      buildMockDonationCreateManyInput({
        index,
        donationAssetTypeId: donationAssetTypes[index % donationAssetTypes.length].id,
        donationMethodId: donationMethods[index % donationMethods.length].id,
        donationTypeId: donationTypes[index % donationTypes.length].id,
        organisationId: organisations[index % organisations.length].id,
        paymentModeId: paymentModes[index % paymentModes.length].id,
        donorId: donors[Math.floor(Math.random() * donors.length)].id,
      }),
    ),
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
