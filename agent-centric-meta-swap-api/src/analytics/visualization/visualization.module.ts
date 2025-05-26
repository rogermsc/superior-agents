import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisualizationService } from './visualization.service';
import { VisualizationController } from './visualization.controller';

@Module({
  imports: [ConfigModule],
  controllers: [VisualizationController],
  providers: [VisualizationService],
  exports: [VisualizationService],
})
export class VisualizationModule {}
