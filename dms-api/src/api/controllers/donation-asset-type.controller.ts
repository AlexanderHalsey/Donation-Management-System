import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonationAssetTypeService } from '@/domain'

import { DonationAssetTypeConverter } from '../converters'

import {
  DonationAssetTypeRequest,
  GetDonationAssetTypeListResponse,
  GetDonationAssetTypeResponse,
} from '../dtos'

@Controller('donation-asset-types')
export class DonationAssetTypeController {
  constructor(
    private readonly donationAssetTypeService: DonationAssetTypeService,
    private readonly donationAssetTypeConverter: DonationAssetTypeConverter,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get donation asset types' })
  @ApiResponse({ status: 200, type: [GetDonationAssetTypeListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonationAssetTypes(): Promise<GetDonationAssetTypeListResponse> {
    const donationAssetTypes = await this.donationAssetTypeService.getAll()
    return {
      donationAssetTypes: donationAssetTypes.map((donationAssetType) =>
        this.donationAssetTypeConverter.convertDonationAssetTypeToDto(donationAssetType),
      ),
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get donation asset type by ID' })
  @ApiResponse({ status: 200, type: GetDonationAssetTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonationAssetTypeById(@Param('id') id: string): Promise<GetDonationAssetTypeResponse> {
    const donationAssetType = await this.donationAssetTypeService.getById(id)
    return {
      donationAssetType:
        this.donationAssetTypeConverter.convertDonationAssetTypeToDto(donationAssetType),
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new donation asset type' })
  @ApiResponse({ status: 201, type: GetDonationAssetTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createDonationAssetType(
    @Body() request: DonationAssetTypeRequest,
  ): Promise<GetDonationAssetTypeResponse> {
    const donationAssetType = await this.donationAssetTypeService.create(request)
    return {
      donationAssetType:
        this.donationAssetTypeConverter.convertDonationAssetTypeToDto(donationAssetType),
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing donation asset type' })
  @ApiResponse({ status: 200, type: GetDonationAssetTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async updateDonationAssetType(
    @Param('id') id: string,
    @Body() request: DonationAssetTypeRequest,
  ): Promise<GetDonationAssetTypeResponse> {
    const donationAssetType = await this.donationAssetTypeService.update(id, request)
    return {
      donationAssetType:
        this.donationAssetTypeConverter.convertDonationAssetTypeToDto(donationAssetType),
    }
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable a donation asset type' })
  @ApiResponse({ status: 200, type: GetDonationAssetTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async disableDonationAssetType(@Param('id') id: string): Promise<GetDonationAssetTypeResponse> {
    const donationAssetType = await this.donationAssetTypeService.disable(id)
    return {
      donationAssetType:
        this.donationAssetTypeConverter.convertDonationAssetTypeToDto(donationAssetType),
    }
  }
}
