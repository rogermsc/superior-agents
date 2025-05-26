import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OneInchProvider } from './oneinch.provider';
import { KyberProvider } from './kyber.provider';
import { OpenFinanceProvider } from './openfinance.provider';
import { OkxProvider } from './okx.provider';
import { RaydiumProvider } from './raydium.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    OneInchProvider,
    KyberProvider,
    OpenFinanceProvider,
    OkxProvider,
    RaydiumProvider,
  ],
  exports: [
    OneInchProvider,
    KyberProvider,
    OpenFinanceProvider,
    OkxProvider,
    RaydiumProvider,
  ],
})
export class SwapProvidersModule {}
