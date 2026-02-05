import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { UserService } from '@/domain'

import { JwtAuthGuard, RolesGuard } from '../guards'
import { Roles } from '../decorators'

import { UserRequest } from '../dtos'

@ApiBearerAuth()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createUser(@Body() request: UserRequest): Promise<void> {
    await this.userService.createUser(request)
  }
}
