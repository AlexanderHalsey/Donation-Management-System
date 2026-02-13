import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'

import { ApiDonorSyncEventRequestException, ApiJobScheduleException } from '@/domain/exceptions'

const logger = new Logger('HttpExceptionFilter')

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const errorResponse = exception.getResponse()

    const loggerMethod: 'error' | 'warn' = [
      ApiDonorSyncEventRequestException,
      ApiJobScheduleException,
    ].some((errorClass) => exception instanceof errorClass)
      ? 'error'
      : 'warn'

    logger[loggerMethod](
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: (errorResponse as any)?.code || 'HTTP_EXCEPTION',
        statusCode: status,
        error: errorResponse,
      },
      `HTTP exception: ${exception.message}`,
    )

    response.status(status).json(errorResponse)
  }
}
