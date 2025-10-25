import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure'

import { Color } from '@shared/models'

@Injectable()
export class ColorService {
  constructor(private readonly prisma: PrismaService) {}

  async getColors(): Promise<Color[]> {
    return this.prisma.color.findMany()
  }

  async addRandomColor(): Promise<Color> {
    const randomColor =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    return this.prisma.color.create({
      data: {
        hexcode: randomColor,
      },
    })
  }
}
