import { Injectable, Logger } from '@nestjs/common'
import { Bucket, Storage } from '@google-cloud/storage'
import { v4 } from 'uuid'

@Injectable()
export class GCSService {
  private readonly logger = new Logger(GCSService.name)
  private bucket: Bucket

  constructor() {
    const storage = new Storage()
    if (!process.env.GCS_BUCKET_NAME) {
      throw new Error('GCS_BUCKET_NAME environment variable is not set.')
    }
    this.bucket = storage.bucket(process.env.GCS_BUCKET_NAME)
  }

  async uploadFile({
    buffer,
    contentType,
    storageKey = v4(),
    gzip = false,
  }: {
    buffer: Buffer
    contentType: string
    storageKey?: string
    gzip?: boolean
  }): Promise<string> {
    await this.bucket.file(storageKey).save(buffer, {
      preconditionOpts: { ifGenerationMatch: 0 },
      validation: 'md5',
      contentType,
      gzip,
    })
    this.logger.log(`File ${storageKey} uploaded to GCS bucket ${this.bucket.name} successfully`)
    return storageKey
  }

  async updateFile({
    storageKey,
    buffer,
    contentType,
    gzip = false,
  }: {
    storageKey: string
    buffer: Buffer
    contentType: string
    gzip?: boolean
  }): Promise<void> {
    const [{ generation }] = await this.bucket.file(storageKey).getMetadata()
    await this.bucket.file(storageKey).save(buffer, {
      preconditionOpts: { ifGenerationMatch: generation },
      validation: 'md5',
      contentType,
      gzip,
    })
    this.logger.log(`File ${storageKey} updated in GCS bucket ${this.bucket.name} successfully`)
  }

  async downloadFile(storageKey: string): Promise<Buffer> {
    const [fileBuffer] = await this.bucket.file(storageKey).download()
    this.logger.log(
      `File ${storageKey} downloaded from GCS bucket ${this.bucket.name} successfully`,
    )
    return fileBuffer
  }

  async deleteFile(storageKey: string): Promise<void> {
    const [{ generation }] = await this.bucket.file(storageKey).getMetadata()
    await this.bucket.file(storageKey).delete({ ifGenerationMatch: generation })
    this.logger.log(`File ${storageKey} deleted from GCS bucket ${this.bucket.name} successfully`)
  }
}
