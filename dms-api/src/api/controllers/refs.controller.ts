import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import {
  DonationAssetTypeService,
  DonationMethodService,
  DonationTypeService,
  DonorService,
  OrganisationService,
  PaymentModeService,
} from '@/domain'

import {
  DonationAssetTypeConverter,
  DonationMethodConverter,
  DonationTypeConverter,
  PaymentModeConverter,
} from '../converters'

import {
  GetDonationAssetTypeListResponse,
  GetDonationMethodListResponse,
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
    private readonly donationAssetTypeService: DonationAssetTypeService,
    private readonly donationAssetTypeConverter: DonationAssetTypeConverter,
    private readonly donationMethodService: DonationMethodService,
    private readonly donationMethodConverter: DonationMethodConverter,
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

  @Get('donation-methods')
  @ApiOperation({ summary: 'Get donation method refs' })
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

  @Get('donation-asset-types')
  @ApiOperation({ summary: 'Get donation asset type refs' })
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
}
