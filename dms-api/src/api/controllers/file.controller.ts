import {
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response, Request } from 'express'
import * as etag from 'etag'

import { FileService } from '@/domain'

import { JwtAuthGuard } from '../guards'

import { FileUploadRequest, FileUploadResponse } from '../dtos'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
    return {
      id: await this.fileService.uploadDraftFile(file),
    }
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Serve a file by ID' })
  @ApiResponse({ status: 200, description: 'File served successfully' })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async downloadFile(@Req() req: Request, @Res() res: Response, @Param('fileId') fileId: string) {
    const { buffer, metadata } = await this.fileService.downloadFile(fileId)

    const tag = etag(buffer)
    if (req.headers['if-none-match'] === tag) {
      res.status(304).send()
      return
    }

    res.setHeader('Content-Type', metadata.mimeType)
    res.setHeader('Content-Disposition', `inline; filename="${metadata.name}"`)
    res.setHeader('ETag', tag)
    res.send(buffer)
  }
}
