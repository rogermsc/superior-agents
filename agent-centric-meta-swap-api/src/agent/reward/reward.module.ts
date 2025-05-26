import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';

@Module({
  imports: [ConfigModule],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
