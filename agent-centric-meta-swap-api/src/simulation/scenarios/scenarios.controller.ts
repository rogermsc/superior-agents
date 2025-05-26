import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScenariosService, ScenarioDataQueryDto, ScenarioMarketDataDto, ScenarioListDto } from './scenarios.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('simulation-scenarios')
@Controller('simulation/scenarios')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('data')
  @ApiOperation({ summary: 'Get scenario market data for a specific time point' })
  @ApiResponse({ status: 200, description: 'Scenario data retrieved successfully', type: ScenarioMarketDataDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async getScenarioData(@Body() params: ScenarioDataQueryDto): Promise<ScenarioMarketDataDto> {
    return this.scenariosService.getScenarioData(params);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available scenario types' })
  @ApiResponse({ status: 200, description: 'Scenario list retrieved successfully', type: ScenarioListDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAvailableScenarios(): Promise<ScenarioListDto> {
    return this.scenariosService.getAvailableScenarios();
  }
}
