import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { AppService } from './app.service'
import { ColorResponseDto } from './color.dto'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('random-color')
  @ApiOperation({
    summary: 'Get Random Color',
    tags: ['Color'],
  })
  @ApiResponse({
    status: 200,
    type: ColorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  getRandomColor(): ColorResponseDto {
    return {
      color: this.appService.getRandomColor(),
    }
  }
}
