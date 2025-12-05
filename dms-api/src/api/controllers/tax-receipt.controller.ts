import { Body, Controller, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { TaxReceiptService } from '@/domain'

import { TaxReceiptConverter } from '../converters'

import {
  CancelTaxReceiptRequest,
  GetTaxReceiptListRequest,
  GetTaxReceiptListResponse,
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

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a tax receipt' })
  @ApiResponse({ status: 200, description: 'Tax receipt cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async cancelTaxReceipt(
    @Param('id') id: string,
    @Body() request: CancelTaxReceiptRequest,
  ): Promise<void> {
    await this.taxReceiptService.cancelTaxReceipt(id, request)
  }
}
