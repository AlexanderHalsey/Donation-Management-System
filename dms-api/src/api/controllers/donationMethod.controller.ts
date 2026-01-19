import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonationMethodService } from '@/domain'

import { DonationMethodConverter } from '../converters'

import {
  DonationMethodRequest,
  GetDonationMethodListResponse,
  GetDonationMethodResponse,
} from '../dtos'

@Controller('donation-methods')
export class DonationMethodController {
  constructor(
    private readonly donationMethodService: DonationMethodService,
    private readonly donationMethodConverter: DonationMethodConverter,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get donation methods' })
  @ApiResponse({ status: 200, type: [GetDonationMethodListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonationMethods(): Promise<GetDonationMethodListResponse> {
    const donationMethods = await this.donationMethodService.getAll()
    return {
      donationMethods: donationMethods.map((donationMethod) =>
        this.donationMethodConverter.convertDonationMethodToDto(donationMethod),
      ),
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get donation method by ID' })
  @ApiResponse({ status: 200, type: GetDonationMethodResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonationMethodById(@Param('id') id: string): Promise<GetDonationMethodResponse> {
    const donationMethod = await this.donationMethodService.getById(id)
    return {
      donationMethod: this.donationMethodConverter.convertDonationMethodToDto(donationMethod),
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new donation method' })
  @ApiResponse({ status: 201, type: GetDonationMethodResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createDonationMethod(
    @Body() request: DonationMethodRequest,
  ): Promise<GetDonationMethodResponse> {
    const donationMethod = await this.donationMethodService.create(request)
    return {
      donationMethod: this.donationMethodConverter.convertDonationMethodToDto(donationMethod),
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing donation method' })
  @ApiResponse({ status: 200, type: GetDonationMethodResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async updateDonationMethod(
    @Param('id') id: string,
    @Body() request: DonationMethodRequest,
  ): Promise<GetDonationMethodResponse> {
    const donationMethod = await this.donationMethodService.update(id, request)
    return {
      donationMethod: this.donationMethodConverter.convertDonationMethodToDto(donationMethod),
    }
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable a donation method' })
  @ApiResponse({ status: 200, type: GetDonationMethodResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async disableDonationMethod(@Param('id') id: string): Promise<GetDonationMethodResponse> {
    const donationMethod = await this.donationMethodService.disable(id)
    return {
      donationMethod: this.donationMethodConverter.convertDonationMethodToDto(donationMethod),
    }
  }
}
