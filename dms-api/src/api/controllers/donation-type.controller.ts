import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonationTypeService } from '@/domain'

import { DonationTypeConverter } from '../converters'

import { DonationTypeRequest, GetDonationTypeListResponse, GetDonationTypeResponse } from '../dtos'

@Controller('donation-types')
export class DonationTypeController {
  constructor(
    private readonly donationTypeService: DonationTypeService,
    private readonly donationTypeConverter: DonationTypeConverter,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get donation types' })
  @ApiResponse({ status: 200, type: [GetDonationTypeListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonationTypes(): Promise<GetDonationTypeListResponse> {
    const donationTypes = await this.donationTypeService.getAll()
    return {
      donationTypes: donationTypes.map((donationType) =>
        this.donationTypeConverter.convertDonationTypeToDto(donationType),
      ),
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get donation type by ID' })
  @ApiResponse({ status: 200, type: GetDonationTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonationTypeById(@Param('id') id: string): Promise<GetDonationTypeResponse> {
    const donationType = await this.donationTypeService.getById(id)
    return {
      donationType: this.donationTypeConverter.convertDonationTypeToDto(donationType),
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new donation type' })
  @ApiResponse({ status: 201, type: GetDonationTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createDonationType(@Body() request: DonationTypeRequest): Promise<GetDonationTypeResponse> {
    const donationType = await this.donationTypeService.create(request)
    return {
      donationType: this.donationTypeConverter.convertDonationTypeToDto(donationType),
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing donation type' })
  @ApiResponse({ status: 200, type: GetDonationTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async updateDonationType(
    @Param('id') id: string,
    @Body() request: DonationTypeRequest,
  ): Promise<GetDonationTypeResponse> {
    const donationType = await this.donationTypeService.update(id, request)
    return {
      donationType: this.donationTypeConverter.convertDonationTypeToDto(donationType),
    }
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable a donation type' })
  @ApiResponse({ status: 200, type: GetDonationTypeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async disableDonationType(@Param('id') id: string): Promise<GetDonationTypeResponse> {
    const donationType = await this.donationTypeService.disable(id)
    return {
      donationType: this.donationTypeConverter.convertDonationTypeToDto(donationType),
    }
  }
}
