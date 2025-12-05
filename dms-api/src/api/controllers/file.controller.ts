import {
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'

import { FileService } from '@/domain'

import { FileUploadRequest, FileUploadResponse } from '../dtos'

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload a draft file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image to upload (jpg, jpeg, png, gif, bmp, webp)',
    type: FileUploadRequest,
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif|bmp|webp)$/ })
        .addMaxSizeValidator({ maxSize: 10 ** 6 }) // 1 MB
        .build(),
    )
    file: Express.Multer.File,
  ): Promise<FileUploadResponse> {
    return { id: await this.fileService.uploadFile(file, 'DRAFT') }
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Serve a file by ID' })
  @ApiResponse({ status: 200, description: 'File served successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async downloadFile(@Res() res: Response, @Param('fileId') fileId: string) {
    const { buffer, metadata } = await this.fileService.downloadFile(fileId)
    res.setHeader('Content-Type', metadata.mimeType)
    res.setHeader('Content-Disposition', `inline; filename="${metadata.name}"`)
    res.send(buffer)
  }
}
