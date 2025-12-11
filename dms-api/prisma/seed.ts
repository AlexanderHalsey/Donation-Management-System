import 'dotenv/config'
import { Organisation, PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { groupBy } from 'es-toolkit'

import {
  buildMockDonationAssetTypeCreateManyInput,
  buildMockDonationCreateManyInput,
  buildMockDonationMethodCreateManyInput,
  buildMockDonationTypeCreateManyInput,
  buildMockDonorCreateManyInput,
  buildMockOrganisationCreateInput,
  buildMockPaymentModeCreateManyInput,
  buildMockTaxReceiptCreateInput,
} from './mocks'

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
})

async function main() {
  const organisations: Organisation[] = []
  for (let i = 0; i < 3; i++) {
    organisations.push(
      await prisma.organisation.create({
        data: buildMockOrganisationCreateInput(i),
      }),
    )
  }

  const paymentModes = await prisma.paymentMode.createManyAndReturn({
    select: { id: true },
    data: new Array(6).fill(null).map((_, index) => buildMockPaymentModeCreateManyInput(index)),
  })

  const donationTypes = await prisma.donationType.createManyAndReturn({
    select: { id: true, isTaxReceiptEnabled: true },
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

  const donations = await prisma.donation.createManyAndReturn({
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
    select: {
      id: true,
      donorId: true,
      donatedAt: true,
      organisationId: true,
      donationTypeId: true,
    },
  })

  const groupedDonationsWithReceipts = groupBy(
    donations
      .filter(
        (donation) =>
          organisations.find((org) => org.id === donation.organisationId)?.isTaxReceiptEnabled &&
          donationTypes.find((dt) => dt.id === donation.donationTypeId)?.isTaxReceiptEnabled,
      )
      .filter(() => Math.random() < 0.6),
    (donation) => `${donation.donorId}-${donation.donatedAt.getFullYear()}`,
  )

  // initialize receipt number sequence - start from 1000
  await prisma.$executeRaw`SELECT setval('"taxreceipt_receiptnumber_seq"', ${1000}, false)`

  for (const donationsWithReceipts of Object.values(groupedDonationsWithReceipts)) {
    await prisma.taxReceipt.create({
      data: buildMockTaxReceiptCreateInput({
        donorId: donationsWithReceipts[0].donorId,
        donations: donationsWithReceipts,
        type: donationsWithReceipts.length === 1 ? 'INDIVIDUAL' : 'ANNUAL',
        createdAt:
          donationsWithReceipts.length === 1
            ? donationsWithReceipts[0].donatedAt
            : new Date(donationsWithReceipts[0].donatedAt.getFullYear(), 3, 1),
      }),
    })
  }
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
