import 'dotenv/config'
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { groupBy } from 'es-toolkit'

import {
  buildMockDonationAssetTypeCreateManyInput,
  buildMockDonationCreateManyInput,
  buildMockDonationMethodCreateManyInput,
  buildMockDonationTypeCreateManyInput,
  buildMockDonorCreateManyInput,
  buildMockOrganisationCreateManyInput,
  buildMockOrganisationFiles,
  buildMockPaymentModeCreateManyInput,
  buildMockTaxReceiptCreateManyInput,
  buildMockTaxReceiptPdfTemplateFile,
} from './mocks'

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
})

async function main() {
  const organisationFiles = await prisma.fileMetadata.createManyAndReturn({
    data: buildMockOrganisationFiles(),
    select: { id: true, name: true },
  })

  const getOrganisationFileId = (type: 'logo' | 'signature') => {
    return organisationFiles.find(
      (file) => file.name === `${type}.${type === 'logo' ? 'png' : 'webp'}`,
    )?.id
  }

  const organisations = await prisma.organisation.createManyAndReturn({
    data: new Array(3)
      .fill(null)
      .map((_, index) =>
        buildMockOrganisationCreateManyInput(
          index,
          index === 0 ? getOrganisationFileId('logo') : undefined,
          index === 0 ? getOrganisationFileId('signature') : undefined,
        ),
      ),
  })

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
  })

  const eligibleDonations = groupBy(
    donations.filter(
      (donation) =>
        organisations.find((org) => org.id === donation.organisationId)?.isTaxReceiptEnabled &&
        donationTypes.find((dt) => dt.id === donation.donationTypeId)?.isTaxReceiptEnabled,
    ),
    (donation) => `${donation.donorId}-${donation.donatedAt.getFullYear()}`,
  )

  const taxReceiptTemplateFiles = await prisma.fileMetadata.createManyAndReturn({
    data: Array(Object.values(eligibleDonations).length)
      .fill(null)
      .map(() => buildMockTaxReceiptPdfTemplateFile()),
    select: { id: true },
  })

  await prisma.taxReceipt.createMany({
    data: Object.values(eligibleDonations).map((donationGroup, index) =>
      buildMockTaxReceiptCreateManyInput({
        index,
        fileId: taxReceiptTemplateFiles[index].id,
        donorId: donationGroup[0].donorId,
        // in reality an annual receipt can absolutely be for a single donation,
        // but this helps us initialise a nice spread of both types in the seed data
        type: donationGroup.length === 1 ? 'INDIVIDUAL' : 'ANNUAL',
        createdAt:
          donationGroup.length === 1
            ? donationGroup[0].donatedAt
            : new Date(donationGroup[0].donatedAt.getFullYear(), 3, 1),
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
