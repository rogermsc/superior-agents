import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ChainType {
  ETH = 'eth',
  SOLANA = 'solana',
}

export class SwapDto {
  @ApiProperty({
    description: 'Source token address',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  @IsString()
  fromToken: string;

  @ApiProperty({
    description: 'Destination token address',
    example: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  })
  @IsString()
  toToken: string;

  @ApiProperty({
    description: 'Amount to swap (in wei/lamports)',
    example: '1000000000000000000',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'Maximum slippage percentage (0.1 = 0.1%)',
    example: 0.5,
    minimum: 0.01,
    maximum: 50,
  })
  @IsNumber()
  @Min(0.01)
  @Max(50)
  @Type(() => Number)
  slippage: number;

  @ApiProperty({
    description: 'Blockchain network',
    enum: ChainType,
    example: ChainType.ETH,
  })
  @IsEnum(ChainType)
  chain: ChainType;

  @ApiProperty({
    description: 'Swap provider to use (optional, will use best if not specified)',
    example: '1inch',
    required: false,
  })
  @IsString()
  @IsOptional()
  provider?: string;
}

export class QuoteDto {
  @ApiProperty({
    description: 'Source token address',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  @IsString()
  fromToken: string;

  @ApiProperty({
    description: 'Destination token address',
    example: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  })
  @IsString()
  toToken: string;

  @ApiProperty({
    description: 'Amount to swap (in wei/lamports)',
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
}

export class SwapResponse {
  @ApiProperty({
    description: 'Transaction hash',
    example: '0x123...',
  })
  txHash: string;

  @ApiProperty({
    description: 'Amount sent',
    example: '1000000000000000000',
  })
  fromAmount: string;

  @ApiProperty({
    description: 'Amount received',
    example: '500000000',
  })
  toAmount: string;

  @ApiProperty({
    description: 'Execution price',
    example: '0.0005',
  })
  executionPrice: string;

  @ApiProperty({
    description: 'Provider used for the swap',
    example: '1inch',
  })
  provider: string;
}

export class ProviderQuote {
  @ApiProperty({
    description: 'Provider name',
    example: '1inch',
  })
  name: string;

  @ApiProperty({
    description: 'Exchange rate',
    example: '0.0005',
  })
  rate: string;

  @ApiProperty({
    description: 'Estimated gas',
    example: '150000',
  })
  estimatedGas: string;

  @ApiProperty({
    description: 'Estimated fee in native token',
    example: '0.005',
  })
  estimatedFee: string;
}

export class QuoteResponse {
  @ApiProperty({
    description: 'Quotes from different providers',
    type: [ProviderQuote],
  })
  providers: ProviderQuote[];

  @ApiProperty({
    description: 'Best provider based on rate and fees',
    example: '1inch',
  })
  bestProvider: string;
}
