import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import {
  DonationService,
  DonationTypeService,
  DonorService,
  OrganisationService,
  PaymentModeService,
} from '@/domain'

import {
  DonationConverter,
  DonationTypeConverter,
  DonorConverter,
  OrganisationConverter,
  PaymentModeConverter,
} from '../converters'

import {
  GetDonationListContextResponse,
  GetDonationListRequest,
  GetDonationListResponse,
  GetDonationResponse,
} from '../dtos'

@Controller('donations')
export class DonationController {
  constructor(
    private readonly donationService: DonationService,
    private readonly donationConverter: DonationConverter,
    private readonly donationTypeService: DonationTypeService,
    private readonly donationTypeConverter: DonationTypeConverter,
    private readonly organisationService: OrganisationService,
    private readonly organisationConverter: OrganisationConverter,
    private readonly paymentModeService: PaymentModeService,
    private readonly paymentModeConverter: PaymentModeConverter,
    private readonly donorService: DonorService,
    private readonly donorConverter: DonorConverter,
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

  @Get('context')
  @ApiOperation({ summary: 'Get context for donation filters' })
  @ApiResponse({ status: 200, type: [GetDonationListContextResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getContext(): Promise<GetDonationListContextResponse> {
    const [paymentModes, organisations, donationTypes, donors] = await Promise.all([
      this.paymentModeService.getAll(),
      this.organisationService.getAllSummaries(),
      this.donationTypeService.getAll(),
      this.donorService.getAllSummaries(),
    ])
    return {
      paymentModes: paymentModes.map((paymentMode) =>
        this.paymentModeConverter.convertPaymentModeToDto(paymentMode),
      ),
      organisations: organisations.map((organisation) =>
        this.organisationConverter.convertOrganisationSummaryToDto(organisation),
      ),
      donationTypes: donationTypes.map((donationType) =>
        this.donationTypeConverter.convertDonationTypeToDto(donationType),
      ),
      donors: donors.map((donor) => this.donorConverter.convertDonorSummaryToDto(donor)),
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
