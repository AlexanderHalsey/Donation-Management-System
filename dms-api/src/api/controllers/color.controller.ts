import { Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { ColorService } from '@/domain'

import { GetColorResponse, GetColorsResponse } from '@shared/dtos'

@Controller('colors')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Colors',
    tags: ['Color'],
  })
  @ApiResponse({
    status: 200,
    type: GetColorsResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getColors(): Promise<GetColorsResponse> {
    return {
      colors: await this.colorService.getColors(),
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Add Random Color',
    tags: ['Color'],
  })
  @ApiResponse({
    status: 200,
    type: GetColorResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async addRandomColor(): Promise<GetColorResponse> {
    return {
      color: await this.colorService.addRandomColor(),
    }
  }
}
