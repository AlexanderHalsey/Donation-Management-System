import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonationService } from '@/domain'

import { DonationConverter } from '../converters'

import { GetDonationListRequest, GetDonationListResponse } from '../dtos'

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
    const [donationList, totalCount] = await Promise.all([
      this.donationService.getFilteredList(pagination, filter),
      this.donationService.getCount(filter),
    ])

    return {
      donations: donationList.map((donation) =>
        this.donationConverter.convertDonationToDto(donation),
      ),
      pagination: {
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        orderBy: pagination.orderBy,
      },
    }
  }
}
