import {
  Controller,
  Get,
  InternalServerErrorException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'

import { pick } from 'es-toolkit'
import {
  startOfMonth as startOfMonthFns,
  startOfWeek as startOfWeekFns,
  startOfYear as startOfYearFns,
} from 'date-fns'

import {
  DonationService,
  DonationTypeService,
  DonorService,
  OrganisationService,
  PaymentModeService,
  TaxReceiptService,
} from '@/domain'

import { JwtAuthGuard } from '../guards'

import { DonationConverter, DonorConverter } from '../converters'

import { GetDashboardSummaryResponse, ChartItemDto } from '../dtos'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('summaries')
export class SummaryController {
  constructor(
    private readonly donationService: DonationService,
    private readonly donorService: DonorService,
    private readonly taxReceiptService: TaxReceiptService,
    private readonly organisationService: OrganisationService,
    private readonly paymentModeService: PaymentModeService,
    private readonly donationTypeService: DonationTypeService,
    private readonly donationConverter: DonationConverter,
    private readonly donorConverter: DonorConverter,
  ) {}

  @Get()
  @CacheKey('dashboard-summary')
  @CacheTTL(20 * 60 * 1000) // 20 minutes
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({ status: 200, type: [GetDashboardSummaryResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getDashboardSummary(): Promise<GetDashboardSummaryResponse> {
    const today = new Date()

    const startOfWeek = startOfWeekFns(today, { weekStartsOn: 1 })
    const startOfMonth = startOfMonthFns(today)
    const startOfYear = startOfYearFns(today)

    const [
      totalDonationsAllTime,
      totalDonationsThisYear,
      totalDonationsThisMonth,
      currentWeekDonationsResult,
      paymentModesDistribution,
      organisationsDistribution,
      donationTypesDistribution,
      paymentModes,
      organisations,
      donationTypes,
      taxReceiptStatusCounts,
      disabledDonors,
      topDonorsByAmount,
      topDonorsByCount,
    ] = await Promise.all([
      this.donationService.getDonationStats(),
      this.donationService.getDonationStats(startOfYear),
      this.donationService.getDonationStats(startOfMonth),
      this.donationService.getFilteredList(
        { page: 1, pageSize: Number.MAX_SAFE_INTEGER, orderBy: { donatedAt: 'desc' } },
        { donatedAt: { gte: startOfWeek } },
      ),
      this.donationService.getDonationDistribution('paymentModeId'),
      this.donationService.getDonationDistribution('organisationId'),
      this.donationService.getDonationDistribution('donationTypeId'),
      this.paymentModeService.getAll(),
      this.organisationService.getAllRefs(),
      this.donationTypeService.getAll(),
      this.taxReceiptService.getTaxReceiptStatusCounts(),
      this.donorService.getFilteredList(
        { page: 1, pageSize: Number.MAX_SAFE_INTEGER },
        { isDisabled: { equals: true } },
      ),
      this.donorService.getFilteredList({
        page: 1,
        pageSize: 10,
        orderBy: { donationTotalAmount: 'desc' },
      }),
      this.donorService.getFilteredList({
        page: 1,
        pageSize: 10,
        orderBy: { donationCount: 'desc' },
      }),
    ])

    return {
      totalDonations: {
        allTime: totalDonationsAllTime,
        thisYear: totalDonationsThisYear,
        thisMonth: totalDonationsThisMonth,
      },
      currentWeekDonations: {
        count: currentWeekDonationsResult.totalCount,
        amount: currentWeekDonationsResult.donations.reduce((sum, d) => sum + d.amount, 0),
        donations: currentWeekDonationsResult.donations.map((donation) =>
          pick(this.donationConverter.convertDonationListItemToDto(donation), [
            'id',
            'amount',
            'donatedAt',
            'donor',
          ]),
        ),
      },
      disabledDonorsWithDonations: disabledDonors.donors.map((donor) =>
        this.donorConverter.convertDonorListItemToDto(donor),
      ),
      topDonors: {
        byAmount: topDonorsByAmount.donors.map((donor) =>
          this.donorConverter.convertDonorListItemToDto(donor),
        ),
        byCount: topDonorsByCount.donors.map((donor) =>
          this.donorConverter.convertDonorListItemToDto(donor),
        ),
      },
      donationCharts: {
        paymentModes: this._distributionToChart(paymentModesDistribution, paymentModes),
        organisations: this._distributionToChart(organisationsDistribution, organisations),
        donationTypes: this._distributionToChart(donationTypesDistribution, donationTypes),
      },
      taxReceiptStatusCounts: taxReceiptStatusCounts,
    }
  }

  private _distributionToChart(
    distribution: { id: string; count: number; amount: number }[],
    models: { id: string; name: string }[],
  ): ChartItemDto[] {
    return distribution.map((item) => {
      const model = models.find((m) => m.id === item.id)
      if (!model) {
        throw new InternalServerErrorException({
          code: 'DASHBOARD_SUMMARY_DATA_INCONSISTENCY',
          message: `Invalid ID found in distribution: ${item.id}`,
        })
      }
      return {
        name: model.name,
        count: item.count,
        amount: item.amount,
      }
    })
  }
}
