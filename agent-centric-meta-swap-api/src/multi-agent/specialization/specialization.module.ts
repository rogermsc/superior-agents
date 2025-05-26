import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpecializationService } from './specialization.service';
import { SpecializationController } from './specialization.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SpecializationController],
  providers: [SpecializationService],
  exports: [SpecializationService],
})
export class SpecializationModule {}
