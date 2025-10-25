import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ColorController } from '@/api/controllers'

import { ColorService } from '@/domain'
import { PrismaService } from '@/infrastructure'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ColorController],
  providers: [ColorService, PrismaService],
})
export class AppModule {}
