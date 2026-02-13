import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'

import { UserService } from '../services/user.service'
import { PrismaService } from '@/infrastructure'

import { User, UserRole } from '@generated/prisma/client'

describe('UserService', () => {
  const prismaMock = mockDeep<PrismaService>()

  let userService: UserService

  beforeEach(async () => {
    mockReset(prismaMock)

    const app: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prismaMock }],
    }).compile()

    app.useLogger(false)

    userService = app.get<UserService>(UserService)
  })

  it('should find user by username', async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(
      mockDeep<User>({
        username: 'testuser',
        passwordHash: 'hash',
        role: UserRole.ADMIN,
      }),
    )
    const user = await userService.findByUserName('testuser')
    expect(user.username).toBe('testuser')
  })

  it('should create a user and hash password', async () => {
    prismaMock.user.create.mockResolvedValue(
      mockDeep<User>({
        username: 'newuser',
        passwordHash: 'hashed',
        role: UserRole.ADMIN,
      }),
    )
    const user = await userService.createUser({
      username: 'newuser',
      password: 'password',
      role: 'admin',
    })
    expect(user.username).toBe('newuser')
    expect(user.role).toBe('admin')
  })

  it('should transform Prisma user to model', () => {
    const prismaUser = mockDeep<User>({
      id: '1',
      username: 'user',
      passwordHash: 'hash',
      role: UserRole.ADMIN,
    })
    const user = userService.transformToModel(prismaUser)
    expect(user.username).toBe('user')
    expect(user.role).toBe('admin')
    expect(user).not.toHaveProperty('passwordHash')
  })
})
