import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoordinationService } from './coordination.service';
import { CoordinationController } from './coordination.controller';

@Module({
  imports: [ConfigModule],
  controllers: [CoordinationController],
  providers: [CoordinationService],
  exports: [CoordinationService],
})
export class CoordinationModule {}
