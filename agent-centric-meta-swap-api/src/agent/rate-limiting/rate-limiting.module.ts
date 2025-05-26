import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RateLimitingService } from './rate-limiting.service';
import { RateLimitingGuard } from './rate-limiting.guard';

@Module({
  imports: [ConfigModule],
  providers: [RateLimitingService, RateLimitingGuard],
  exports: [RateLimitingService, RateLimitingGuard],
})
export class RateLimitingModule {}
