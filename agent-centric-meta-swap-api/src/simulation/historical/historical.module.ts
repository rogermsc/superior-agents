import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HistoricalService } from './historical.service';
import { HistoricalController } from './historical.controller';

@Module({
  imports: [ConfigModule],
  controllers: [HistoricalController],
  providers: [HistoricalService],
  exports: [HistoricalService],
})
export class HistoricalModule {}
