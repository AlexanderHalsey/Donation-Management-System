import { Injectable } from '@nestjs/common'

import { jsPDF, jsPDFOptions } from 'jspdf'
import imageSize from 'image-size'
import { PDFDocument, PDFImage } from 'pdf-lib'

export const PDF = {
  MARGIN: 18,
  PAGE_WIDTH: 595.28,
  PAGE_HEIGHT: 841.89,
  PADDING: 10,
  TITLE_HEIGHT: 60,
  LINE_WIDTH: 1,
} as const

interface PDFRendererDefinition {
  drawHorizontalLine({ y, startX, endX }: { y: number; startX?: number; endX?: number }): number
  drawVerticalLine({ x, startY, endY }: { x: number; startY?: number; endY?: number }): number
  addText({
    text,
    x,
    y,
    fontSize,
    fontStyle,
    lineHeightFactor,
  }: {
    text: string
    x?: number
    y: number
    fontSize?: number
    fontStyle?: 'normal' | 'bold' | 'italic'
    lineHeightFactor?: number
  }): number
  addImage({
    buffer,
    x,
    y,
    size,
  }: {
    buffer: Buffer
    x: number
    y: number
    size: { width: number } | { height: number }
  }): void
  addPage(): void
  addPageBorder(): void
  addSection({
    startY,
    title,
    cb,
  }: {
    startY: number
    title?: string
    cb: (y: number) => number
  }): number
  addWatermarkImageToExistingPdf(
    existingPdfBuffer: Buffer,
    watermarkImageBuffer: Buffer,
    imageType: 'png' | 'jpg',
    scaleRatio: number,
  ): Promise<Buffer>
  output(): Buffer
}

@Injectable()
export class PDFRendererService implements PDFRendererDefinition {
  private doc: jsPDF

  initialize(options?: jsPDFOptions): void {
    this.doc = new jsPDF(options)
    this.doc.setLineWidth(PDF.LINE_WIDTH)
    this.addPageBorder()
  }

  drawHorizontalLine({ y, startX, endX }: { y: number; startX?: number; endX?: number }): number {
    const lineStartX = startX ?? PDF.MARGIN
    const lineEndX = endX ?? PDF.PAGE_WIDTH - PDF.MARGIN
    this.doc.line(lineStartX, y, lineEndX, y)
    return y + PDF.LINE_WIDTH
  }

  drawVerticalLine({ x, startY, endY }: { x: number; startY?: number; endY?: number }): number {
    const lineStartY = startY ?? PDF.MARGIN
    const lineEndY = endY ?? PDF.PAGE_HEIGHT - PDF.MARGIN

    this.doc.line(x, lineStartY, x, lineEndY)
    return x
  }

  addText({
    text,
    x,
    y,
    fontSize = 11,
    fontStyle = 'normal',
    lineHeightFactor = 1.4,
  }: {
    text: string
    x?: number
    y: number
    fontSize?: number
    fontStyle?: 'normal' | 'bold' | 'italic'
    lineHeightFactor?: number
  }): number {
    const textWidth = PDF.PAGE_WIDTH - PDF.MARGIN * 2 - PDF.PADDING * 2

    this.doc.setFont('helvetica', fontStyle)
    this.doc.setFontSize(fontSize)

    const textLines = this.doc.splitTextToSize(text, textWidth)
    this.doc.text(textLines, x ?? PDF.MARGIN + PDF.PADDING, y + fontSize / 3, {
      baseline: 'top',
      lineHeightFactor,
    })

    return y + textLines.length * fontSize * lineHeightFactor
  }

  addImage({
    buffer,
    x,
    y,
    size,
  }: {
    buffer: Buffer
    x: number
    y: number
    size: { width: number } | { height: number }
  }) {
    const imgSize = imageSize(buffer)
    if ('width' in size) {
      const aspectRatio = imgSize.width / imgSize.height
      size = { width: size.width, height: size.width / aspectRatio }
    } else if ('height' in size) {
      const aspectRatio = imgSize.width / imgSize.height
      size = { width: size.height * aspectRatio, height: size.height }
    }
    this.doc.addImage(buffer, x, y, size['width'], size['height'])
  }

  addTable(...params: Parameters<jsPDF['table']>) {
    this.doc.table(...params)
  }

  addPageBorder() {
    this.doc.rect(
      PDF.MARGIN,
      PDF.MARGIN,
      PDF.PAGE_WIDTH - PDF.MARGIN * 2,
      PDF.PAGE_HEIGHT - PDF.MARGIN * 2,
    )
  }

  addPage(): number {
    this.doc.addPage()
    this.addPageBorder()
    return PDF.MARGIN
  }

  addSection({
    startY,
    title,
    cb,
  }: {
    startY: number
    title?: string
    cb: (y: number) => number
  }): number {
    this.drawHorizontalLine({ y: startY })
    let y = startY + PDF.PADDING
    if (title) {
      y =
        this.addText({
          text: title,
          x: PDF.MARGIN + PDF.PADDING,
          y,
          fontStyle: 'bold',
        }) + 5
    }
    y = cb(y)
    return y + PDF.PADDING
  }

  async addWatermarkImageToExistingPdf(
    existingPdfBuffer: Buffer,
    watermarkImageBuffer: Buffer,
    imageType: 'png' | 'jpg',
    scaleRatio: number,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(existingPdfBuffer)

    let watermarkImage: PDFImage
    if (imageType === 'png') {
      watermarkImage = await pdfDoc.embedPng(watermarkImageBuffer)
    } else {
      watermarkImage = await pdfDoc.embedJpg(watermarkImageBuffer)
    }

    const pages = pdfDoc.getPages()

    for (const page of pages) {
      const { width, height } = page.getSize()
      const imageAspectRatio = watermarkImage.width / watermarkImage.height
      const watermarkSize = Math.min(width, height) * scaleRatio

      page.drawImage(watermarkImage, {
        x: width / 2 - (watermarkSize * imageAspectRatio) / 2,
        y: height / 2 - watermarkSize / 2,
        width: watermarkSize * imageAspectRatio,
        height: watermarkSize,
        opacity: 0.4,
      })
    }

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  }

  output(): Buffer {
    return Buffer.from(this.doc.output('arraybuffer'))
  }
}
