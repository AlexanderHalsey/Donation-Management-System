import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import {
  DonationTypeService,
  DonorService,
  OrganisationService,
  PaymentModeService,
} from '@/domain'

import { DonationTypeConverter, PaymentModeConverter } from '../converters'

import {
  GetDonationTypeListResponse,
  GetDonorRefListResponse,
  GetOrganisationRefListResponse,
  GetPaymentModeListResponse,
} from '../dtos'

@Controller('refs')
export class RefsController {
  constructor(
    private readonly donationTypeService: DonationTypeService,
    private readonly donationTypeConverter: DonationTypeConverter,
    private readonly organisationService: OrganisationService,
    private readonly paymentModeService: PaymentModeService,
    private readonly paymentModeConverter: PaymentModeConverter,
    private readonly donorService: DonorService,
  ) {}

  @Get('payment-modes')
  @ApiOperation({ summary: 'Get payment mode refs' })
  @ApiResponse({ status: 200, type: [GetPaymentModeListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getPaymentModes(): Promise<GetPaymentModeListResponse> {
    const paymentModes = await this.paymentModeService.getAll()
    return {
      paymentModes: paymentModes.map((paymentMode) =>
        this.paymentModeConverter.convertPaymentModeToDto(paymentMode),
      ),
    }
  }

  @Get('donation-types')
  @ApiOperation({ summary: 'Get donation type refs' })
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

  @Get('organisations')
  @ApiOperation({ summary: 'Get organisation refs' })
  @ApiResponse({ status: 200, type: [GetOrganisationRefListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getOrganisations(): Promise<GetOrganisationRefListResponse> {
    return {
      organisationRefs: await this.organisationService.getAllRefs(),
    }
  }

  @Get('donors')
  @ApiOperation({ summary: 'Get donor refs' })
  @ApiResponse({ status: 200, type: [GetDonorRefListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDonors(): Promise<GetDonorRefListResponse> {
    return {
      donorRefs: await this.donorService.getAllRefs(),
    }
  }
}
