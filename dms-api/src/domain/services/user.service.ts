import { Injectable, Logger } from '@nestjs/common'

import * as bcrypt from 'bcrypt'
import { omit } from 'es-toolkit'

import { PrismaService } from '@/infrastructure'

import { User as PrismaUser, UserRole as PrismaUserRole } from '@generated/prisma/client'
import { User, UserRole } from '@shared/models'

const BCRYPT_SALT_ROUNDS = 12

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findByUserName(username: string): Promise<PrismaUser> {
    const user = this.prisma.user.findUniqueOrThrow({
      where: { username },
    })

    this.logger.log(`Retrieved user with username ${username}`)

    return user
  }

  async createUser({
    username,
    password,
    role,
  }: {
    username: string
    password: string
    role: UserRole
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
    const prismaUser = await this.prisma.user.create({
      data: {
        username,
        passwordHash,
        role: role.toUpperCase() as keyof typeof PrismaUserRole,
      },
    })

    this.logger.log(`Created user with username ${username} and role ${role}`)

    return this.transformToModel(prismaUser)
  }

  transformToModel(user: PrismaUser): User {
    return {
      ...omit(user, ['passwordHash', 'role']),
      role: user.role.toLowerCase() as UserRole,
    }
  }
}
