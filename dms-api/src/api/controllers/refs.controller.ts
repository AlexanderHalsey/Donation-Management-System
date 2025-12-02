import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonorService } from '@/domain'

import { GetDonorRefListResponse } from '../dtos'

@Controller('refs')
export class RefsController {
  constructor(private readonly donorService: DonorService) {}

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
