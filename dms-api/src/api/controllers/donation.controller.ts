import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonationService } from '@/domain'

import { DonationConverter } from '../converters'

import { GetDonationListRequest, GetDonationListResponse, GetDonationResponse } from '../dtos'

@Controller('donations')
export class DonationController {
  constructor(
    private readonly donationService: DonationService,
    private readonly donationConverter: DonationConverter,
  ) {}

  @Post('filtered-list')
  @ApiOperation({ summary: 'Get filtered list of donations' })
  @ApiResponse({ status: 200, type: [GetDonationListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getFilteredList(
    @Body() { pagination, filter }: GetDonationListRequest,
  ): Promise<GetDonationListResponse> {
    const { donations, totalCount } = await this.donationService.getFilteredList(pagination, filter)

    return {
      donations: donations.map((donation) =>
        this.donationConverter.convertDonationListItemToDto(donation),
      ),
      pagination: {
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        orderBy: pagination.orderBy,
      },
    }
  }

  @Get(':donationId')
  @ApiOperation({ summary: 'Get donation by ID' })
  @ApiResponse({ status: 200, type: GetDonationResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonationById(@Param('donationId') donationId: string): Promise<GetDonationResponse> {
    const donation = await this.donationService.getById(donationId)
    return {
      donation: this.donationConverter.convertDonationToDto(donation),
    }
  }
}
