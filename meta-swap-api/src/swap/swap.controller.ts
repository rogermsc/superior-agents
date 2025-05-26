import { Controller, Post, Get, Body, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwapService } from './swap.service';
import { SwapDto, QuoteDto, SwapResponse, QuoteResponse } from './swap.dto';

@ApiTags('swap')
@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post()
  @ApiOperation({ summary: 'Execute a token swap' })
  @ApiBody({ type: SwapDto })
  @ApiResponse({ status: 200, description: 'Swap executed successfully', type: SwapResponse })
  async executeSwap(@Body() swapDto: SwapDto): Promise<SwapResponse> {
    return this.swapService.executeSwap(swapDto);
  }

  @Get('quote')
  @ApiOperation({ summary: 'Get quotes from all available providers' })
  @ApiQuery({ name: 'fromToken', description: 'Source token address' })
  @ApiQuery({ name: 'toToken', description: 'Destination token address' })
  @ApiQuery({ name: 'amount', description: 'Amount to swap (in wei/lamports)' })
  @ApiQuery({ name: 'chain', description: 'Blockchain network (eth, solana)' })
  @ApiResponse({ status: 200, description: 'Quotes retrieved successfully', type: QuoteResponse })
  async getQuotes(
    @Query(new ValidationPipe({ transform: true })) quoteDto: QuoteDto,
  ): Promise<QuoteResponse> {
    return this.swapService.getQuotes(quoteDto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
