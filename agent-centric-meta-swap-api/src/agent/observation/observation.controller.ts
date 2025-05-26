import { Controller, Get, Post, Body, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ObservationService, ObservationParamsDto, MarketObservationDto } from './observation.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';

@ApiTags('agent-observation')
@Controller('agent/observation')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class ObservationController {
  constructor(private readonly observationService: ObservationService) {}

  @Post('market')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get market observation data' })
  @ApiResponse({ status: 200, description: 'Observation data retrieved successfully', type: MarketObservationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMarketObservation(@Body() params: ObservationParamsDto): Promise<MarketObservationDto> {
    return this.observationService.getMarketObservation(params);
  }

  @Get('market/quick')
  @ApiOperation({ summary: 'Get quick market observation with default parameters' })
  @ApiResponse({ status: 200, description: 'Quick observation data retrieved successfully', type: MarketObservationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQuickMarketObservation(@Query('tokens') tokens: string): Promise<MarketObservationDto> {
    const tokenList = tokens.split(',');
    const params: ObservationParamsDto = {
      tokens: tokenList,
      includeTokenPrices: true,
      includeSwapRates: true,
      includeGasEstimates: true,
    };
    return this.observationService.getMarketObservation(params);
  }
}
