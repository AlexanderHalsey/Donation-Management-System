export class WorkerJobScheduleException extends Error {
  public readonly code: string

  constructor(payload: { code: string; message: string; stack?: string }) {
    super(payload.message)
    this.name = 'WorkerJobScheduleException'
    this.code = payload.code
    if (payload.stack) {
      this.stack = payload.stack
    }
  }
}
