import {
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@generated/prisma/client'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2025':
        throw new NotFoundException({
          code: 'RESOURCE_NOT_FOUND',
          message: 'The requested resource was not found or does not exist',
        })
      case 'P2002':
        throw new ConflictException({
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'A record with the same unique field already exists',
        })
      case 'P2003':
        throw new BadRequestException({
          code: 'INVALID_REFERENCE',
          message: 'Invalid reference to related resource',
        })
      case 'P2014':
        throw new BadRequestException({
          code: 'INVALID_ID',
          message: 'Invalid ID provided',
        })
      default:
        throw exception
    }
  }
}
