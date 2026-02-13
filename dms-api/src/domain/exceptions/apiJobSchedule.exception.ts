import { InternalServerErrorException } from '@nestjs/common'

export class ApiJobScheduleException extends InternalServerErrorException {
  constructor(payload: { code: string; message: string; stack?: string }) {
    super(payload)
  }
}
