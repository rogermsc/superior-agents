import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';

@Module({
  imports: [ConfigModule],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
