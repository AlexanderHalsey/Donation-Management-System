import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'

import { JwtRefreshAuthGuard, LocalAuthGuard } from '../guards'

import { AuthService } from '@/domain'

import { LoginUserRequest, LoginUserResponse } from '../dtos'
import { Response } from 'express'
import { User } from '@shared/models'

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, type: LoginUserResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async login(
    @Req() { user }: { user: User },
    @Body() _body: LoginUserRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserResponse> {
    const { accessToken, refreshToken } = await this.authService.issueTokens(user)
    this.setRefreshTokenCookie(res, refreshToken)
    return { accessToken }
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: LoginUserResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async refresh(
    @Req() { user }: { user: User },
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserResponse> {
    const { accessToken, refreshToken } = await this.authService.issueTokens(user)
    this.setRefreshTokenCookie(res, refreshToken)
    return { accessToken }
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: this.configService.get<number>('JWT_REFRESH_TOKEN_LIFETIME_MS'),
    })
  }
}
