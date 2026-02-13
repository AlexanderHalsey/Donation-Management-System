import { ArgumentsHost, Catch, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

const logger = new Logger('AllExceptionsFilter')

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    logger.error(
      {
        code: 'INTERNAL_SERVER_ERROR',
        error: exception,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      `Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
    )

    super.catch(exception, host)
  }
}
