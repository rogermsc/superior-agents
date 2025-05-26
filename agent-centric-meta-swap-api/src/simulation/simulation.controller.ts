import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SimulationService, SimulationInitParamsDto, SimulationEnvironmentDto, SimulationStateDto } from './simulation.service';
import { AgentAuthGuard } from '../agent/auth/agent-auth.guard';

@ApiTags('simulation')
@Controller('simulation')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post()
  @ApiOperation({ summary: 'Initialize a new simulation environment' })
  @ApiResponse({ status: 201, description: 'Simulation environment created successfully', type: SimulationEnvironmentDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async initializeSimulation(@Body() params: SimulationInitParamsDto): Promise<SimulationEnvironmentDto> {
    return this.simulationService.initializeSimulation(params);
  }

  @Get(':simulationId')
  @ApiOperation({ summary: 'Get the current state of a simulation environment' })
  @ApiResponse({ status: 200, description: 'Simulation state retrieved successfully', type: SimulationStateDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async getSimulationState(@Param('simulationId') simulationId: string): Promise<SimulationStateDto> {
    return this.simulationService.getSimulationState(simulationId);
  }

  @Patch(':simulationId/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause a running simulation' })
  @ApiResponse({ status: 200, description: 'Simulation paused successfully', type: SimulationStateDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async pauseSimulation(@Param('simulationId') simulationId: string): Promise<SimulationStateDto> {
    return this.simulationService.pauseSimulation(simulationId);
  }

  @Patch(':simulationId/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a paused simulation' })
  @ApiResponse({ status: 200, description: 'Simulation resumed successfully', type: SimulationStateDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async resumeSimulation(@Param('simulationId') simulationId: string): Promise<SimulationStateDto> {
    return this.simulationService.resumeSimulation(simulationId);
  }

  @Patch(':simulationId/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset a simulation to its initial state' })
  @ApiResponse({ status: 200, description: 'Simulation reset successfully', type: SimulationStateDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async resetSimulation(@Param('simulationId') simulationId: string): Promise<SimulationStateDto> {
    return this.simulationService.resetSimulation(simulationId);
  }

  @Delete(':simulationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate and clean up a simulation' })
  @ApiResponse({ status: 200, description: 'Simulation terminated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async terminateSimulation(@Param('simulationId') simulationId: string): Promise<{ success: boolean }> {
    return this.simulationService.terminateSimulation(simulationId);
  }
}
