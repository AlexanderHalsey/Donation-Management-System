import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'

import * as cookieParser from 'cookie-parser'
import { json } from 'express'

import {
  AllExceptionsFilter,
  HttpExceptionFilter,
  PrismaClientExceptionFilter,
} from './api/filters'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  app.useLogger(app.get(Logger))
  app.flushLogs()

  app.use(/^\/(api\/)?donor-sync-events/, json({ limit: '500mb' /* For send all function */ }))
  app.use(json({ limit: '100kb' }))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  app.use(cookieParser())

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: 'http://localhost:5173',
      credentials: true,
      exposedHeaders: ['content-disposition', 'etag'],
    })
  }

  const config = new DocumentBuilder().setTitle('DMS API').setVersion('1.0').addBearerAuth().build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  const { httpAdapter } = app.get<HttpAdapterHost>(HttpAdapterHost)
  // Order matters here - https://docs.nestjs.com/exception-filters#catch-everything
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter),
    new PrismaClientExceptionFilter(),
    new HttpExceptionFilter(),
  )

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
