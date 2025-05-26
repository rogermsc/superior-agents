import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EthereumSigner } from './ethereum.signer';
import { SolanaSigner } from './solana.signer';

@Module({
  imports: [ConfigModule],
  providers: [EthereumSigner, SolanaSigner],
  exports: [EthereumSigner, SolanaSigner],
})
export class SignersModule {}
