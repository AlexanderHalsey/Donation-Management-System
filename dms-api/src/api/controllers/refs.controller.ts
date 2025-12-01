import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonorService, OrganisationService } from '@/domain'

import { GetDonorRefListResponse, GetOrganisationRefListResponse } from '../dtos'

@Controller('refs')
export class RefsController {
  constructor(
    private readonly organisationService: OrganisationService,
    private readonly donorService: DonorService,
  ) {}

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
