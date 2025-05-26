import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BenchmarksService } from './benchmarks.service';
import { BenchmarksController } from './benchmarks.controller';

@Module({
  imports: [ConfigModule],
  controllers: [BenchmarksController],
  providers: [BenchmarksService],
  exports: [BenchmarksService],
})
export class BenchmarksModule {}
