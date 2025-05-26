import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentAuthModule } from './auth/agent-auth.module';
import { ObservationModule } from './observation/observation.module';
import { ActionModule } from './action/action.module';
import { RewardModule } from './reward/reward.module';
import { RateLimitingModule } from './rate-limiting/rate-limiting.module';

@Module({
  imports: [
    ConfigModule,
    AgentAuthModule,
    ObservationModule,
    ActionModule,
    RewardModule,
    RateLimitingModule,
  ],
  exports: [
    AgentAuthModule,
    ObservationModule,
    ActionModule,
    RewardModule,
    RateLimitingModule,
  ],
})
export class AgentModule {}
