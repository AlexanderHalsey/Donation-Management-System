import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { PaymentModeService } from '@/domain'

import { PaymentModeConverter } from '../converters'

import { PaymentModeRequest, GetPaymentModeListResponse, GetPaymentModeResponse } from '../dtos'

@Controller('payment-modes')
export class PaymentModeController {
  constructor(
    private readonly paymentModeService: PaymentModeService,
    private readonly paymentModeConverter: PaymentModeConverter,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get payment modes' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get payment mode by ID' })
  @ApiResponse({ status: 200, type: GetPaymentModeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getPaymentModeById(@Param('id') id: string): Promise<GetPaymentModeResponse> {
    const paymentMode = await this.paymentModeService.getById(id)
    return {
      paymentMode: this.paymentModeConverter.convertPaymentModeToDto(paymentMode),
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment mode' })
  @ApiResponse({ status: 201, type: GetPaymentModeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createPaymentMode(@Body() request: PaymentModeRequest): Promise<GetPaymentModeResponse> {
    const paymentMode = await this.paymentModeService.create(request)
    return {
      paymentMode: this.paymentModeConverter.convertPaymentModeToDto(paymentMode),
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing payment mode' })
  @ApiResponse({ status: 200, type: GetPaymentModeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async updatePaymentMode(
    @Param('id') id: string,
    @Body() request: PaymentModeRequest,
  ): Promise<GetPaymentModeResponse> {
    const paymentMode = await this.paymentModeService.update(id, request)
    return {
      paymentMode: this.paymentModeConverter.convertPaymentModeToDto(paymentMode),
    }
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable a payment mode' })
  @ApiResponse({ status: 200, type: GetPaymentModeResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async disablePaymentMode(@Param('id') id: string): Promise<GetPaymentModeResponse> {
    const paymentMode = await this.paymentModeService.disable(id)
    return {
      paymentMode: this.paymentModeConverter.convertPaymentModeToDto(paymentMode),
    }
  }
}
