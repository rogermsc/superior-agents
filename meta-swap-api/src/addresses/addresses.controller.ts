import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('common/:chain/:symbol')
  @ApiOperation({ summary: 'Get common token address' })
  @ApiParam({ name: 'chain', description: 'Blockchain network (eth, solana)', example: 'eth' })
  @ApiParam({ name: 'symbol', description: 'Token symbol', example: 'USDC' })
  @ApiResponse({ status: 200, description: 'Token address' })
  getCommonTokenAddress(
    @Param('chain') chain: string,
    @Param('symbol') symbol: string,
  ): { address: string } {
    const address = this.addressesService.getCommonTokenAddress(chain, symbol);
    return { address };
  }

  @Get('validate/:chain')
  @ApiOperation({ summary: 'Validate address for a specific chain' })
  @ApiParam({ name: 'chain', description: 'Blockchain network (eth, solana)', example: 'eth' })
  @ApiQuery({ name: 'address', description: 'Address to validate', example: '0x1234...' })
  @ApiResponse({ status: 200, description: 'Address validation result' })
  validateAddress(
    @Param('chain') chain: string,
    @Query('address') address: string,
  ): { isValid: boolean } {
    const isValid = this.addressesService.isValidAddress(chain, address);
    return { isValid };
  }

  @Get('common/:chain')
  @ApiOperation({ summary: 'Get all common tokens for a specific chain' })
  @ApiParam({ name: 'chain', description: 'Blockchain network (eth, solana)', example: 'eth' })
  @ApiResponse({ status: 200, description: 'List of common tokens' })
  getAllCommonTokens(@Param('chain') chain: string): Record<string, string> {
    return this.addressesService.getAllCommonTokens(chain);
  }

  @Get('wrapped/:chain')
  @ApiOperation({ summary: 'Get native wrapped token for a specific chain' })
  @ApiParam({ name: 'chain', description: 'Blockchain network (eth, solana)', example: 'eth' })
  @ApiResponse({ status: 200, description: 'Wrapped token address' })
  getNativeWrappedToken(@Param('chain') chain: string): { address: string } {
    const address = this.addressesService.getNativeWrappedToken(chain);
    return { address };
  }
}
