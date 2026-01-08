import { Body, Controller, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { TaxReceiptService } from '@/domain'

import { TaxReceiptConverter } from '../converters'

import {
  CancelTaxReceiptRequest,
  GetTaxReceiptListRequest,
  GetTaxReceiptListResponse,
  GetTaxReceiptResponse,
} from '../dtos'

@Controller('tax-receipts')
export class TaxReceiptController {
  constructor(
    private readonly taxReceiptService: TaxReceiptService,
    private readonly taxReceiptConverter: TaxReceiptConverter,
  ) {}

  @Post('filtered-list')
  @ApiOperation({ summary: 'Get filtered list of tax receipts' })
  @ApiResponse({ status: 200, type: [GetTaxReceiptListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getFilteredList(
    @Body() { pagination, filter }: GetTaxReceiptListRequest,
  ): Promise<GetTaxReceiptListResponse> {
    const { taxReceipts, totalCount } = await this.taxReceiptService.getFilteredList(
      pagination,
      filter,
    )

    return {
      taxReceipts: taxReceipts.map((taxReceipt) =>
        this.taxReceiptConverter.convertTaxReceiptListItemToDto(taxReceipt),
      ),
      pagination: {
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        orderBy: pagination.orderBy,
      },
    }
  }

  @Post('individual/:donationId')
  @ApiOperation({ summary: 'Generate an individual tax receipt for a donation' })
  @ApiResponse({ status: 200, description: 'Individual tax receipt generated successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createIndividualTaxReceipt(
    @Param('donationId') donationId: string,
  ): Promise<GetTaxReceiptResponse> {
    const taxReceiptId = await this.taxReceiptService.createTaxReceipt({
      donationIds: [donationId],
      taxReceiptType: 'INDIVIDUAL',
    })

    return { taxReceiptId }
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a tax receipt' })
  @ApiResponse({ status: 200, description: 'Tax receipt canceled successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async cancelTaxReceipt(
    @Param('id') id: string,
    @Body() request: CancelTaxReceiptRequest,
  ): Promise<void> {
    await this.taxReceiptService.cancelTaxReceipt(id, request)
  }

  @Post(':id/retry-failed')
  @ApiOperation({ summary: 'Retry generating a failed tax receipt' })
  @ApiResponse({ status: 200, description: 'Tax receipt generation retried successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async retryFailedTaxReceipt(@Param('id') id: string): Promise<void> {
    const taxReceipt = await this.taxReceiptService.getTaxReceiptById(id)
    if (taxReceipt.status !== 'FAILED') {
      throw new Error('Only failed tax receipts can be retried. Tax receipt id : ' + id)
    }
    await this.taxReceiptService.processTaxReceiptGeneration({
      taxReceiptId: id,
      taxReceiptNumber: taxReceipt.receiptNumber,
      donationIds: taxReceipt.donationIds,
      taxReceiptType: taxReceipt.type,
    })
  }
}
