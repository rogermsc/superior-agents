import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TimeControlService } from './time-control.service';
import { TimeControlController } from './time-control.controller';

@Module({
  imports: [ConfigModule],
  controllers: [TimeControlController],
  providers: [TimeControlService],
  exports: [TimeControlService],
})
export class TimeControlModule {}
