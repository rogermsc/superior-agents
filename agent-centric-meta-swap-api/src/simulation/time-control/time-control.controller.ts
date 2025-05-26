import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TimeControlService, TimeControlInitParamsDto, TimeControlConfigDto, TimeInfoDto } from './time-control.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('simulation-time-control')
@Controller('simulation/time-control')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class TimeControlController {
  constructor(private readonly timeControlService: TimeControlService) {}

  @Get(':simulationId')
  @ApiOperation({ summary: 'Get current simulation time' })
  @ApiResponse({ status: 200, description: 'Time information retrieved successfully', type: TimeInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async getCurrentTime(@Param('simulationId') simulationId: string): Promise<TimeInfoDto> {
    return this.timeControlService.getCurrentTime(simulationId);
  }

  @Patch(':simulationId/scale')
  @ApiOperation({ summary: 'Set time scale for a simulation' })
  @ApiResponse({ status: 200, description: 'Time scale updated successfully', type: TimeInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async setTimeScale(
    @Param('simulationId') simulationId: string,
    @Body() body: { timeScale: number }
  ): Promise<TimeInfoDto> {
    return this.timeControlService.setTimeScale(simulationId, body.timeScale);
  }

  @Patch(':simulationId/time')
  @ApiOperation({ summary: 'Set current simulation time' })
  @ApiResponse({ status: 200, description: 'Current time updated successfully', type: TimeInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async setCurrentTime(
    @Param('simulationId') simulationId: string,
    @Body() body: { timestamp: string }
  ): Promise<TimeInfoDto> {
    return this.timeControlService.setCurrentTime(simulationId, body.timestamp);
  }
}
