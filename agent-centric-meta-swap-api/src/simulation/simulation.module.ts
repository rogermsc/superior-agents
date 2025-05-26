import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { HistoricalModule } from './historical/historical.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { TimeControlModule } from './time-control/time-control.module';

@Module({
  imports: [
    ConfigModule,
    HistoricalModule,
    ScenariosModule,
    TimeControlModule,
  ],
  controllers: [SimulationController],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}
