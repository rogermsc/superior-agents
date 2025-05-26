import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObservationService } from './observation.service';
import { ObservationController } from './observation.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ObservationController],
  providers: [ObservationService],
  exports: [ObservationService],
})
export class ObservationModule {}
