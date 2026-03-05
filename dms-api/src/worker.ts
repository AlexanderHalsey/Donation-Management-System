import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'
import { WorkerModule } from './worker.module'

async function bootstrap() {
  const worker = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  })

  worker.useLogger(worker.get(Logger))
  worker.flushLogs()
}
bootstrap()
