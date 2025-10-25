import { Test, TestingModule } from '@nestjs/testing'
import { ColorController } from './color.controller'
import { ColorService } from '@/domain'

describe('ColorController', () => {
  let colorController: ColorController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ColorController],
      providers: [ColorService],
    }).compile()

    colorController = app.get<ColorController>(ColorController)
  })

  describe('root', () => {
    it('should return a random color', () => {
      expect(colorController.addRandomColor()).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })
})
