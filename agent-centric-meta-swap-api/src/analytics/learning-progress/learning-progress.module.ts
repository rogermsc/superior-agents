import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LearningProgressService } from './learning-progress.service';
import { LearningProgressController } from './learning-progress.controller';

@Module({
  imports: [ConfigModule],
  controllers: [LearningProgressController],
  providers: [LearningProgressService],
  exports: [LearningProgressService],
})
export class LearningProgressModule {}
