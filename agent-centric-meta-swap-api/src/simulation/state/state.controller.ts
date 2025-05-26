import { Controller, Get, Post, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StateService, StateSaveParamsDto, StateInfoDto, StateListDto, SimulationStateData } from './state.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('simulation-state')
@Controller('simulation/state')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post('save')
  @ApiOperation({ summary: 'Save current simulation state' })
  @ApiResponse({ status: 201, description: 'State saved successfully', type: StateInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async saveState(@Body() params: StateSaveParamsDto): Promise<StateInfoDto> {
    return this.stateService.saveState(params);
  }

  @Get(':stateId')
  @ApiOperation({ summary: 'Load a saved simulation state' })
  @ApiResponse({ status: 200, description: 'State loaded successfully', type: SimulationStateData })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'State not found' })
  async loadState(@Param('stateId') stateId: string): Promise<SimulationStateData> {
    return this.stateService.loadState(stateId);
  }

  @Get('list/:simulationId')
  @ApiOperation({ summary: 'List saved states for a simulation' })
  @ApiResponse({ status: 200, description: 'State list retrieved successfully', type: StateListDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listStates(@Param('simulationId') simulationId: string): Promise<StateListDto> {
    return this.stateService.listStates(simulationId);
  }

  @Delete(':stateId')
  @ApiOperation({ summary: 'Delete a saved state' })
  @ApiResponse({ status: 200, description: 'State deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'State not found' })
  async deleteState(@Param('stateId') stateId: string): Promise<{ success: boolean }> {
    return this.stateService.deleteState(stateId);
  }
}
