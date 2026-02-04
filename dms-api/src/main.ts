import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import * as cookieParser from 'cookie-parser'
import { json } from 'express'

import { PrismaClientExceptionFilter } from './api/filters'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use('/donor-sync-events', json({ limit: '500mb' /* For send all function */ }))
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
      exposedHeaders: ['content-disposition'],
    })
  }

  const config = new DocumentBuilder().setTitle('DMS API').setVersion('1.0').addBearerAuth().build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  const { httpAdapter } = app.get<HttpAdapterHost>(HttpAdapterHost)
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
