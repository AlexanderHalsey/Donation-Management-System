import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { formatISO } from 'date-fns'
import { groupBy } from 'es-toolkit'

import { DonationService, TaxReceiptService } from '@/domain'
import { BullMQService } from '@/infrastructure'

import { JwtAuthGuard } from '../guards'

import { DonationConverter, DonorConverter, TaxReceiptConverter } from '../converters'

import {
  BulkAnnualTaxReceiptRequest,
  BulkAnnualTaxReceiptResponse,
  CancelTaxReceiptRequest,
  GetEligibleTaxReceiptDonorsResponse,
  GetEligibleTaxReceiptYearOrganisationsResponse,
  GetTaxReceiptListRequest,
  GetTaxReceiptListResponse,
  GetTaxReceiptResponse,
} from '../dtos'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tax-receipts')
export class TaxReceiptController {
  constructor(
    private readonly taxReceiptService: TaxReceiptService,
    private readonly taxReceiptConverter: TaxReceiptConverter,
    private readonly donationService: DonationService,
    private readonly donationConverter: DonationConverter,
    private readonly donorConverter: DonorConverter,
    private readonly bullMQService: BullMQService,
  ) {}

  @Post('filtered-list')
  @ApiOperation({ summary: 'Get filtered list of tax receipts' })
  @ApiResponse({ status: 200, type: [GetTaxReceiptListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getFilteredList(
    @Body() { pagination, filter }: GetTaxReceiptListRequest,
  ): Promise<GetTaxReceiptListResponse> {
    const { taxReceipts, totalCount } = await this.taxReceiptService.getFilteredList(
      pagination,
      filter,
    )

    return {
      taxReceipts: taxReceipts.map((taxReceipt) =>
        this.taxReceiptConverter.convertTaxReceiptListItemToDto(taxReceipt),
      ),
      pagination: {
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        orderBy: pagination.orderBy,
      },
    }
  }

  @Get('eligible-year-organisations')
  @ApiOperation({ summary: 'Get eligible years for annual tax receipts' })
  @ApiResponse({
    status: 200,
    description: 'Eligible years for annual tax receipts retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getEligibleTaxReceiptYearOrganisations(): Promise<GetEligibleTaxReceiptYearOrganisationsResponse> {
    const yearOrganisationPairs =
      await this.donationService.getEligibleTaxReceiptYearOrganisations()
    return {
      yearOrganisationPairs: yearOrganisationPairs.map((yearInfo) => ({
        ...yearInfo,
        isReleased: this.taxReceiptService.isTaxReceiptYearReleased(yearInfo.year),
      })),
      releaseDate: formatISO(this.taxReceiptService.taxReceiptReleaseDate()),
    }
  }

  @Get('eligible-donors/:year/:organisationId')
  @ApiOperation({ summary: 'Get eligible tax receipt donors for a given year and organisation' })
  @ApiResponse({ status: 200, description: 'Eligible tax receipt donors retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getEligibleTaxReceiptDonors(
    @Param('year') year: number,
    @Param('organisationId') organisationId: string,
  ): Promise<GetEligibleTaxReceiptDonorsResponse> {
    const eligibleDonations = await this.donationService.getEligibleTaxReceiptDonations({
      year,
      organisationId,
    })
    return {
      year,
      organisationId,
      eligibleDonors: Object.entries(
        groupBy(eligibleDonations, (donation) => donation.donor.id),
      ).map(([_, donorDonations]) => {
        const donorDto = this.donorConverter.convertDonorToDto(donorDonations[0].donor)
        return {
          ...donorDto,
          donations: donorDonations.map((donation) =>
            this.donationConverter.convertDonationListItemToDto(donation),
          ),
        }
      }),
    }
  }

  @Post('individual/:donationId')
  @ApiOperation({ summary: 'Generate an individual tax receipt for a donation' })
  @ApiResponse({ status: 200, description: 'Individual tax receipt generated successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createIndividualTaxReceipt(
    @Param('donationId') donationId: string,
  ): Promise<GetTaxReceiptResponse> {
    return await this.taxReceiptService.createIndividualTaxReceipt({
      donationId,
    })
  }

  @Post('annual/bulk/:year/:organisationId')
  @ApiOperation({ summary: 'Generate annual bulk tax receipts for a given year and organisation' })
  @ApiResponse({ status: 200, description: 'Annual bulk tax receipts generation started' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createAnnualBulkTaxReceipts(
    @Param('year') year: number,
    @Param('organisationId') organisationId: string,
    @Body() { donorIds }: BulkAnnualTaxReceiptRequest,
  ): Promise<BulkAnnualTaxReceiptResponse> {
    return await this.taxReceiptService.createAnnualTaxReceipts({ organisationId, donorIds, year })
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a tax receipt' })
  @ApiResponse({ status: 200, description: 'Tax receipt canceled successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async cancelTaxReceipt(
    @Param('id') id: string,
    @Body() request: CancelTaxReceiptRequest,
  ): Promise<void> {
    await this.taxReceiptService.cancelTaxReceipt(id, request)
  }

  @Post(':id/retry-failed')
  @ApiOperation({ summary: 'Retry generating a failed tax receipt' })
  @ApiResponse({ status: 200, description: 'Tax receipt generation retried successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async retryFailedTaxReceipt(@Param('id') id: string): Promise<void> {
    const taxReceipt = await this.taxReceiptService.getTaxReceiptById(id)
    if (taxReceipt.status !== 'FAILED') {
      throw new BadRequestException(
        'Only failed tax receipts can be retried. Tax receipt id : ' + id,
      )
    }
    await this.bullMQService.addTaxReceiptJob('GENERATE', {
      taxReceiptId: id,
      taxReceiptNumber: taxReceipt.receiptNumber,
      donationIds: taxReceipt.donationIds,
      taxReceiptType: taxReceipt.type,
    })
  }
}
