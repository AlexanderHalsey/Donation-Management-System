import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'

import * as bcrypt from 'bcrypt'

import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'
import { JwtService } from '@nestjs/jwt'

import { User as PrismaUser } from '@generated/prisma/client'
import { User } from '@shared/models'

jest.mock('bcrypt')

describe('AuthService', () => {
  const userServiceMock = mockDeep<UserService>()
  const jwtServiceMock = mockDeep<JwtService>()
  const jwtRefreshServiceMock = mockDeep<JwtService>()

  let authService: AuthService

  beforeEach(async () => {
    mockReset(userServiceMock)
    mockReset(jwtServiceMock)
    mockReset(jwtRefreshServiceMock)

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userServiceMock },
        { provide: 'JWT_SERVICE', useValue: jwtServiceMock },
        { provide: 'JWT_REFRESH_SERVICE', useValue: jwtRefreshServiceMock },
      ],
    }).compile()

    app.useLogger(false)

    authService = app.get<AuthService>(AuthService)
  })

  it('should validate user with correct password', async () => {
    userServiceMock.findByUserName.mockResolvedValue(
      mockDeep<PrismaUser>({ username: 'user', passwordHash: 'hash' }),
    )
    userServiceMock.transformToModel.mockReturnValue(mockDeep<User>({ username: 'user', id: '1' }))
    const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
    mockBcrypt.compare.mockResolvedValueOnce(true as unknown as never)
    const user = await authService.validateUser('user', 'password')
    expect(user?.username).toBe('user')
  })

  it('should return null for invalid password', async () => {
    userServiceMock.findByUserName.mockResolvedValue(
      mockDeep<PrismaUser>({ username: 'user', passwordHash: 'hash' }),
    )
    const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
    mockBcrypt.compare.mockResolvedValueOnce(false as unknown as never)
    const user = await authService.validateUser('user', 'wrongpassword')
    expect(user).toBeNull()
  })

  it('should return access and refresh tokens', async () => {
    jwtServiceMock.sign.mockReturnValue('jwt-token')
    jwtRefreshServiceMock.sign.mockReturnValue('jwt-refresh-token')

    const user = mockDeep<User>({ username: 'user', id: '1' })
    const result = await authService.issueTokens(user)
    expect(result.accessToken).toBe('jwt-token')
    expect(result.refreshToken).toBe('jwt-refresh-token')
  })
})
