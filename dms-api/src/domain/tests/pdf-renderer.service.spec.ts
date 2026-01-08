import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep, mockReset } from 'jest-mock-extended'

import { jsPDF } from 'jspdf'
import { PDFDocument, PDFImage, PDFPage } from 'pdf-lib'
import imageSize from 'image-size'

import { PDFRendererService, PDF } from '../services/pdf-renderer.service'
import { Return } from '@prisma/client/runtime/client'

jest.mock('jspdf', () => ({ jsPDF: jest.fn() }))
jest.mock('pdf-lib', () => ({ PDFDocument: { load: jest.fn() } }))
jest.mock('image-size')

describe('PDFRendererService', () => {
  const mockJsPDF = mockDeep<InstanceType<typeof jsPDF>>()
  const mockPdfDocument = mockDeep<Awaited<ReturnType<typeof PDFDocument.load>>>()

  let pdfRendererService: PDFRendererService

  const options = { unit: 'pt', format: 'a4' } as const

  beforeEach(async () => {
    mockReset(mockJsPDF)
    mockReset(mockPdfDocument)
    ;(jsPDF as jest.MockedClass<typeof jsPDF>).mockImplementation(() => mockJsPDF)
    ;(PDFDocument.load as jest.MockedFunction<typeof PDFDocument.load>).mockResolvedValue(
      mockPdfDocument,
    )

    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [PDFRendererService],
    }).compile()

    pdfRendererService = app.get<PDFRendererService>(PDFRendererService)
    pdfRendererService.initialize(options)
  })

  it('should create a new jsPDF instance and set up the document', () => {
    expect(jsPDF).toHaveBeenCalled()
    expect(mockJsPDF.setLineWidth).toHaveBeenCalledWith(PDF.LINE_WIDTH)
    expect(mockJsPDF.rect).toHaveBeenCalledWith(
      PDF.MARGIN,
      PDF.MARGIN,
      PDF.PAGE_WIDTH - PDF.MARGIN * 2,
      PDF.PAGE_HEIGHT - PDF.MARGIN * 2,
    )
  })

  describe('drawHorizontalLine', () => {
    it('should draw a horizontal line with default start and end positions', () => {
      const y = 100
      const result = pdfRendererService.drawHorizontalLine({ y })

      expect(mockJsPDF.line).toHaveBeenCalledWith(PDF.MARGIN, y, PDF.PAGE_WIDTH - PDF.MARGIN, y)
      expect(result).toBe(y + PDF.LINE_WIDTH)
    })

    it('should draw a horizontal line with custom start and end positions', () => {
      const y = 100
      const startX = 50
      const endX = 300
      const result = pdfRendererService.drawHorizontalLine({ y, startX, endX })

      expect(mockJsPDF.line).toHaveBeenCalledWith(startX, y, endX, y)
      expect(result).toBe(y + PDF.LINE_WIDTH)
    })
  })

  describe('drawVerticalLine', () => {
    it('should draw a vertical line with default start and end positions', () => {
      const x = 100
      const result = pdfRendererService.drawVerticalLine({ x })

      expect(mockJsPDF.line).toHaveBeenCalledWith(x, PDF.MARGIN, x, PDF.PAGE_HEIGHT - PDF.MARGIN)
      expect(result).toBe(x)
    })

    it('should draw a vertical line with custom start and end positions', () => {
      const x = 100
      const startY = 50
      const endY = 300
      const result = pdfRendererService.drawVerticalLine({ x, startY, endY })

      expect(mockJsPDF.line).toHaveBeenCalledWith(x, startY, x, endY)
      expect(result).toBe(x)
    })
  })

  describe('addText', () => {
    it('should add text with default parameters', () => {
      const text = 'Test text'
      const y = 100

      mockJsPDF.splitTextToSize.mockReturnValue([text])

      const result = pdfRendererService.addText({ text, y })

      expect(mockJsPDF.setFont).toHaveBeenCalledWith('helvetica', 'normal')
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(11)
      expect(mockJsPDF.splitTextToSize).toHaveBeenCalledWith(
        text,
        PDF.PAGE_WIDTH - PDF.MARGIN * 2 - PDF.PADDING * 2,
      )
      expect(mockJsPDF.text).toHaveBeenCalledWith([text], PDF.MARGIN + PDF.PADDING, y + 11 / 3, {
        baseline: 'top',
        lineHeightFactor: 1.4,
      })
      expect(result).toBe(y + 11 * 1.4) // 1 line * fontSize * lineHeightFactor
    })

    it('should add text with custom parameters', () => {
      const text = 'Custom text'
      const x = 50
      const y = 100
      const fontSize = 14
      const fontStyle = 'bold'
      const lineHeightFactor = 1.6

      mockJsPDF.splitTextToSize.mockReturnValue([text])

      const result = pdfRendererService.addText({
        text,
        x,
        y,
        fontSize,
        fontStyle,
        lineHeightFactor,
      })

      expect(mockJsPDF.setFont).toHaveBeenCalledWith('helvetica', fontStyle)
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(fontSize)
      expect(mockJsPDF.text).toHaveBeenCalledWith([text], x, y + fontSize / 3, {
        baseline: 'top',
        lineHeightFactor,
      })
      expect(result).toBe(y + fontSize * lineHeightFactor)
    })
  })

  describe('addImage', () => {
    beforeEach(() => {
      ;(imageSize as jest.Mock).mockReturnValue({ width: 250, height: 100 })
    })
    it('should add image with width constraint', () => {
      const buffer = Buffer.from('test-image')
      const x = 50
      const y = 100
      const size = { width: 150 }

      pdfRendererService.addImage({ buffer, x, y, size })

      const expectedHeight = 150 / 2.5 // width / aspectRatio (250/100 = 2.5)
      expect(mockJsPDF.addImage).toHaveBeenCalledWith(buffer, x, y, 150, expectedHeight)
    })

    it('should add image with height constraint', () => {
      const buffer = Buffer.from('test-image')
      const x = 50
      const y = 100
      const size = { height: 75 }

      pdfRendererService.addImage({ buffer, x, y, size })

      const expectedWidth = 75 * 2.5 // height * aspectRatio (250/100 = 2.5)
      expect(mockJsPDF.addImage).toHaveBeenCalledWith(buffer, x, y, expectedWidth, 75)
    })
  })

  it('should add a table', () => {
    const x = 10
    const y = 20
    const data = [{ name: 'John', age: '30' }]
    const columns = ['name', 'age']
    const options = { fontSize: 12 }

    pdfRendererService.addTable(x, y, data, columns, options)

    expect(mockJsPDF.table).toHaveBeenCalledWith(x, y, data, columns, options)
  })

  it('should draw a border rectangle around the page', () => {
    // Border is already added during initialization
    expect(mockJsPDF.rect).toHaveBeenCalledWith(
      PDF.MARGIN,
      PDF.MARGIN,
      PDF.PAGE_WIDTH - PDF.MARGIN * 2,
      PDF.PAGE_HEIGHT - PDF.MARGIN * 2,
    )
  })

  it('should add a new page with border and return margin', () => {
    const result = pdfRendererService.addPage()

    expect(mockJsPDF.addPage).toHaveBeenCalledTimes(1)
    expect(mockJsPDF.rect).toHaveBeenCalledWith(
      PDF.MARGIN,
      PDF.MARGIN,
      PDF.PAGE_WIDTH - PDF.MARGIN * 2,
      PDF.PAGE_HEIGHT - PDF.MARGIN * 2,
    )
    expect(result).toBe(PDF.MARGIN)
  })

  describe('addSection', () => {
    beforeEach(() => {
      mockJsPDF.splitTextToSize.mockImplementation((text) => [text])
    })
    it('should add section without title', () => {
      const startY = 100
      const mockCb = jest.fn().mockReturnValue(150)

      const result = pdfRendererService.addSection({ startY, cb: mockCb })

      expect(mockJsPDF.line).toHaveBeenCalledWith(
        PDF.MARGIN,
        startY,
        PDF.PAGE_WIDTH - PDF.MARGIN,
        startY,
      )
      expect(mockCb).toHaveBeenCalledWith(startY + PDF.PADDING)
      expect(result).toBe(150 + PDF.PADDING)
    })

    it('should add section with title', () => {
      const startY = 100
      const title = 'Section Title'
      const mockCb = jest.fn().mockReturnValue(150)

      pdfRendererService.addSection({ startY, title, cb: mockCb })

      expect(mockJsPDF.line).toHaveBeenCalled()
      expect(mockJsPDF.setFont).toHaveBeenCalledWith('helvetica', 'bold')
      expect(mockCb).toHaveBeenCalled()
    })
  })

  describe('addWatermarkImageToExistingPdf', () => {
    const mockWatermarkImage = { width: 100, height: 100 }
    const pageSize = { width: 600, height: 800 }

    beforeEach(() => {
      mockPdfDocument.getPages.mockReturnValue([
        mockDeep<PDFPage>({ getSize: jest.fn(() => pageSize) }),
      ])
      mockPdfDocument.save.mockResolvedValue(Buffer.from('modified-pdf'))
    })

    it('should add PNG watermark to existing PDF', async () => {
      const existingPdfBuffer = Buffer.from('existing-pdf')
      const watermarkImageBuffer = Buffer.from('watermark')
      const scaleRatio = 0.3

      mockPdfDocument.embedPng.mockResolvedValue(mockDeep<PDFImage>(mockWatermarkImage))

      const result = await pdfRendererService.addWatermarkImageToExistingPdf(
        existingPdfBuffer,
        watermarkImageBuffer,
        'png',
        scaleRatio,
      )

      expect(mockPdfDocument.embedPng).toHaveBeenCalledWith(watermarkImageBuffer)
      expect(mockPdfDocument.getPages).toHaveBeenCalled()
      expect(mockPdfDocument.getPages()[0].getSize).toHaveBeenCalled()
      expect(result).toBeInstanceOf(Buffer)
    })

    it('should add JPG watermark to existing PDF', async () => {
      const existingPdfBuffer = Buffer.from('existing-pdf')
      const watermarkImageBuffer = Buffer.from('watermark')
      const scaleRatio = 0.3

      mockPdfDocument.embedJpg.mockResolvedValue(mockDeep<PDFImage>(mockWatermarkImage))

      await pdfRendererService.addWatermarkImageToExistingPdf(
        existingPdfBuffer,
        watermarkImageBuffer,
        'jpg',
        scaleRatio,
      )

      expect(mockPdfDocument.embedJpg).toHaveBeenCalledWith(watermarkImageBuffer)
      expect(mockPdfDocument.getPages).toHaveBeenCalled()
      expect(mockPdfDocument.getPages()[0].getSize).toHaveBeenCalled()
    })
  })

  it('should return PDF output as buffer', () => {
    mockJsPDF.output.mockReturnValueOnce(
      'mock-value' as unknown as ReturnType<typeof mockJsPDF.output>,
    )
    const result = pdfRendererService.output()

    expect(mockJsPDF.output).toHaveBeenCalledWith('arraybuffer')
    expect(result).toBeInstanceOf(Buffer)
  })
})
