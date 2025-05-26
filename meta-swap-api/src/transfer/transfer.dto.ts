import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum ChainType {
  ETH = 'eth',
  SOLANA = 'solana',
}

export class TransferDto {
  @ApiProperty({
    description: 'Token address to transfer',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Recipient address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsString()
  recipient: string;

  @ApiProperty({
    description: 'Amount to transfer (in wei/lamports)',
    example: '1000000000000000000',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'Blockchain network',
    enum: ChainType,
    example: ChainType.ETH,
  })
  @IsEnum(ChainType)
  chain: ChainType;

  @ApiProperty({
    description: 'Optional memo or reference',
    example: 'Payment for services',
    required: false,
  })
  @IsString()
  @IsOptional()
  memo?: string;
}

export class TransferResponse {
  @ApiProperty({
    description: 'Transaction hash',
    example: '0x123...',
  })
  txHash: string;

  @ApiProperty({
    description: 'Token address',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  token: string;

  @ApiProperty({
    description: 'Recipient address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  recipient: string;

  @ApiProperty({
    description: 'Amount transferred',
    example: '1000000000000000000',
  })
  amount: string;

  @ApiProperty({
    description: 'Blockchain network',
    enum: ChainType,
    example: ChainType.ETH,
  })
  chain: ChainType;
}
