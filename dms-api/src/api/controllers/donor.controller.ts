import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonorService } from '@/domain'

import { DonorConverter } from '../converters'

import { GetDonorListRequest, GetDonorListResponse, GetDonorResponse } from '../dtos'

@Controller('donors')
export class DonorController {
  constructor(
    private readonly donorService: DonorService,
    private readonly donorConverter: DonorConverter,
  ) {}

  @Post('filtered-list')
  @ApiOperation({ summary: 'Get filtered list of donors' })
  @ApiResponse({ status: 200, type: [GetDonorListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getFilteredList(
    @Body() { pagination, filter }: GetDonorListRequest,
  ): Promise<GetDonorListResponse> {
    const { donors, totalCount } = await this.donorService.getFilteredList(pagination, filter)

    return {
      donors: donors.map((donor) => this.donorConverter.convertDonorListItemToDto(donor)),
      pagination: {
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        orderBy: pagination.orderBy,
      },
    }
  }

  @Get(':donorId')
  @ApiOperation({ summary: 'Get donor by ID' })
  @ApiResponse({ status: 200, type: GetDonorResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonorById(@Param('donorId') donorId: string): Promise<GetDonorResponse> {
    const donor = await this.donorService.getById(donorId)
    return {
      donor: this.donorConverter.convertDonorToDto(donor),
    }
  }
}
