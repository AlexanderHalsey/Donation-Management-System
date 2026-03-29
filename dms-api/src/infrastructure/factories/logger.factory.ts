import { ConfigService } from '@nestjs/config'

import { levels, type DestinationStream } from 'pino'
import type { Options } from 'pino-http'
import { Logtail } from '@logtail/node'

import { omit } from 'es-toolkit'

import { GCSService } from '../services/gcs.service'

export const usePinoLoggerFactory = (
  configService: ConfigService,
  gcsService: GCSService,
): {
  pinoHttp: Options | [Options, DestinationStream]
} => {
  const redactOptions = {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'res.headers["set-cookie"]',
    ],
    censor: '******',
  }
  if (configService.get<string>('NODE_ENV') !== 'production') {
    return {
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
        redact: redactOptions,
      },
    }
  }
  const logtail = new Logtail(configService.getOrThrow<string>('LOGTAIL_SOURCE_TOKEN'), {
    endpoint: `https://${configService.getOrThrow<string>('LOGTAIL_INGESTING_HOST')}`,
  })
  return {
    pinoHttp: [
      {
        redact: redactOptions,
      },
      {
        write: (msg: string) => {
          try {
            const logEntry = JSON.parse(msg)

            logtail.log(
              logEntry.msg,
              levels.labels[logEntry.level] || 'info',
              omit(logEntry, ['msg', 'level']),
            )
            if (logEntry.level >= 50) {
              logtail.warn('Error log detected, uploading to GCS...')
              gcsService
                .uploadFile({
                  buffer: Buffer.from(msg),
                  contentType: 'application/json',
                  storageKey: `logs/error-${new Date().toISOString()}.json`,
                  gzip: true,
                })
                .catch((err) => {
                  logtail.error(`Failed to upload error log to GCS: ${err.message}`)
                })
            }
          } catch (err) {
            logtail.error('Failed to parse log message', {
              originalMessage: msg,
              error: err instanceof Error ? err.message : String(err),
            })
          }
        },
      },
    ],
  }
}
