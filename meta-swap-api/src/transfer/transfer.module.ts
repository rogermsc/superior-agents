import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { SignersModule } from '../signers/signers.module';

@Module({
  imports: [
    ConfigModule,
    SignersModule,
  ],
  controllers: [TransferController],
  providers: [TransferService],
  exports: [TransferService],
})
export class TransferModule {}
