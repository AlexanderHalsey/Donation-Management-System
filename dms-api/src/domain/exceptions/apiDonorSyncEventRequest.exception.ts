import { BadRequestException } from '@nestjs/common'

export class ApiDonorSyncEventRequestException extends BadRequestException {
  constructor(payload: { code: string; message: string; stack?: string }) {
    super(payload)
  }
}
