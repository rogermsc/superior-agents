import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwapModule } from './swap/swap.module';
import { GlobalModule } from './global/global.module';
import { SignersModule } from './signers/signers.module';
import { SwapProvidersModule } from './swap-providers/swap-providers.module';
import { AddressesModule } from './addresses/addresses.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GlobalModule,
    SignersModule,
    SwapModule,
    SwapProvidersModule,
    AddressesModule,
    TransferModule,
  ],
})
export class AppModule {}
