import { Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { DonationService } from '@/domain'

@Controller('donations')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}
}
