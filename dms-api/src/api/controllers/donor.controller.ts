import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'

import { DonorService } from '@/domain'

import { JwtAuthGuard } from '../guards'

import { DonorConverter } from '../converters'

import {
  GetDonorListRequest,
  GetDonorListResponse,
  GetDonorRefListResponse,
  GetDonorResponse,
} from '../dtos'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

  @Get('refs')
  @CacheKey('donor-refs')
  @CacheTTL(24 * 60 * 60 * 1000) // 24 hours
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get donor refs' })
  @ApiResponse({ status: 200, type: [GetDonorRefListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonors(): Promise<GetDonorRefListResponse> {
    return {
      donorRefs: await this.donorService.getAllRefs(),
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
