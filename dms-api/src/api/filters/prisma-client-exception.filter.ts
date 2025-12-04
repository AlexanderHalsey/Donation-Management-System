import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@generated/prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    switch (exception.code) {
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND
        response.status(status).json({
          statusCode: status,
          message: 'Resource not found',
        })
        break
      }
      case 'P2002': {
        const status = HttpStatus.CONFLICT
        response.status(status).json({
          statusCode: status,
          message: `Unique constraint failed`,
          fields:
            exception.meta?.['driverAdapterError']?.['cause']?.['constraint']?.['fields'] ?? [],
        })
        break
      }
      case 'P2003': {
        const status = HttpStatus.BAD_REQUEST
        response.status(status).json({
          statusCode: status,
          message: 'Invalid reference to related resource',
        })
        break
      }
      case 'P2014': {
        const status = HttpStatus.BAD_REQUEST
        response.status(status).json({
          statusCode: status,
          message: 'Invalid ID provided',
        })
        break
      }
      default:
        super.catch(exception, host)
        break
    }
  }
}
