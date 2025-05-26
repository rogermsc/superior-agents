import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HistoricalService, HistoricalDataQueryDto, HistoricalMarketDataDto, HistoricalTimeRangeDto } from './historical.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('simulation-historical')
@Controller('simulation/historical')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class HistoricalController {
  constructor(private readonly historicalService: HistoricalService) {}

  @Post('data')
  @ApiOperation({ summary: 'Get historical market data for a specific time point' })
  @ApiResponse({ status: 200, description: 'Historical data retrieved successfully', type: HistoricalMarketDataDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async getHistoricalData(@Body() params: HistoricalDataQueryDto): Promise<HistoricalMarketDataDto> {
    return this.historicalService.getHistoricalData(params);
  }

  @Get('time-range')
  @ApiOperation({ summary: 'Get available time range for historical data' })
  @ApiResponse({ status: 200, description: 'Time range retrieved successfully', type: HistoricalTimeRangeDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAvailableTimeRange(): Promise<HistoricalTimeRangeDto> {
    return this.historicalService.getAvailableTimeRange();
  }
}
