import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DonationController } from '@/api/controllers'

import { DonationService } from '@/domain'
import { PrismaService } from '@/infrastructure'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [DonationController],
  providers: [DonationService, PrismaService],
})
export class AppModule {}
