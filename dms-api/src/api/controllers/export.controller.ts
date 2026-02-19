import { Controller, Res, Post, Body, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'

import { ExportService } from '@/domain'

import { JwtAuthGuard } from '../guards'
import { ParsedLanguage } from '../decorators'

import { GetExportDonationListRequest, GetExportDonorListRequest } from '@/api/dtos'
import type { Language } from '@/domain/types'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('donations/csv')
  @ApiOperation({ summary: 'Export donation list as CSV' })
  @ApiResponse({ status: 200, description: 'File served successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async exportDonationListCsv(
    @Res() res: Response,
    @Body() { orderBy, filter }: GetExportDonationListRequest,
    @ParsedLanguage() language: Language,
  ) {
    const result = await this.exportService.exportDonationListCsv(language, orderBy, filter)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${language === 'en' ? 'donations' : 'dons'}.csv"`,
    )
    res.send(result)
  }

  @Post('donors/csv')
  @ApiOperation({ summary: 'Export donor list as CSV' })
  @ApiResponse({ status: 200, description: 'File served successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async exportDonorListCsv(
    @Res() res: Response,
    @Body() { orderBy, filter }: GetExportDonorListRequest,
    @ParsedLanguage() language: Language,
  ) {
    const result = await this.exportService.exportDonorListCsv(language, orderBy, filter)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${language === 'en' ? 'donors' : 'donateurs'}.csv"`,
    )
    res.send(result)
  }
}
