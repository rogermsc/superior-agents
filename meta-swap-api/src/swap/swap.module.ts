import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwapService } from './swap.service';
import { SwapController } from './swap.controller';
import { SwapProvidersModule } from '../swap-providers/swap-providers.module';
import { SignersModule } from '../signers/signers.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    ConfigModule,
    SwapProvidersModule,
    SignersModule,
    AddressesModule,
  ],
  controllers: [SwapController],
  providers: [SwapService],
  exports: [SwapService],
})
export class SwapModule {}
