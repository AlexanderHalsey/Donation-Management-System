import {
  Controller,
  Delete,
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

import { FileConverter } from '../converters'

import { FileUploadRequest, FileUploadResponseDto } from '../dtos'

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly fileConverter: FileConverter,
  ) {}

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload a draft file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image to upload (jpg, jpeg, png, gif, bmp)',
    type: FileUploadRequest,
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif|bmp)$/ })
        .addMaxSizeValidator({ maxSize: 10 ** 6 }) // 1 MB
        .build(),
    )
    file: Express.Multer.File,
  ): Promise<FileUploadResponseDto> {
    return { id: await this.fileService.uploadDraftFile(file) }
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Download a file by ID' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async downloadFile(@Res() res: Response, @Param('fileId') fileId: string) {
    const { buffer, metadata } = await this.fileService.downloadFile(fileId)
    res.setHeader('Content-Type', metadata.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`)
    res.send(buffer)
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete a file by ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async deleteFile(@Param('fileId') fileId: string): Promise<void> {
    await this.fileService.deleteFile(fileId)
  }
}
