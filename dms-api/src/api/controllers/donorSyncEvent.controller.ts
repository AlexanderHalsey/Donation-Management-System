import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonorSyncEventAuthGuard } from '../guards'

import { DonorSyncEventService } from '@/domain'

@Controller('donor-sync-events')
export class DonorSyncEventController {
  constructor(private readonly donorSyncEventService: DonorSyncEventService) {}

  @Post()
  @UseGuards(DonorSyncEventAuthGuard)
  @ApiOperation({ summary: 'Add Donor Sync events' })
  @ApiResponse({ status: 200, description: 'Donor Sync events received successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid credentials' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async addDonorSyncEvents(@Body() body: unknown) {
    await this.donorSyncEventService.addDonorSyncEvents(body)
  }
}
