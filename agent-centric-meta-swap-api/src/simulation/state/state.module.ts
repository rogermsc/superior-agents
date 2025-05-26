import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StateService } from './state.service';
import { StateController } from './state.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StateController],
  providers: [StateService],
  exports: [StateService],
})
export class StateModule {}
