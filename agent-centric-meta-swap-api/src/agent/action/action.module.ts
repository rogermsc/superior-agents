import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActionService } from './action.service';
import { ActionController } from './action.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ActionController],
  providers: [ActionService],
  exports: [ActionService],
})
export class ActionModule {}
