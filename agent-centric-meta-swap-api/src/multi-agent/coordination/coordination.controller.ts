import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  CoordinationService, 
  CreateAgentPoolDto,
  AgentPoolInfoDto,
  AddAgentToPoolDto,
  AgentPoolDetailsDto,
  CreateTaskAllocationDto,
  TaskAllocationInfoDto,
  TaskAllocationDetailsDto,
  SubmitTaskResultDto,
  CreateCollaborationSessionDto,
  CollaborationSessionInfoDto,
  CollaborationSessionDetailsDto
} from './coordination.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('multi-agent-coordination')
@Controller('multi-agent/coordination')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class CoordinationController {
  constructor(private readonly coordinationService: CoordinationService) {}

  @Post('pools')
  @ApiOperation({ summary: 'Create a new agent pool' })
  @ApiResponse({ status: 201, description: 'Agent pool created successfully', type: AgentPoolInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAgentPool(@Body() params: CreateAgentPoolDto): Promise<AgentPoolInfoDto> {
    return this.coordinationService.createAgentPool(params);
  }

  @Post('pools/agents')
  @ApiOperation({ summary: 'Add agent to pool' })
  @ApiResponse({ status: 200, description: 'Agent added to pool successfully', type: AgentPoolInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pool not found' })
  async addAgentToPool(@Body() params: AddAgentToPoolDto): Promise<AgentPoolInfoDto> {
    return this.coordinationService.addAgentToPool(params);
  }

  @Get('pools/:poolId')
  @ApiOperation({ summary: 'Get agent pool details' })
  @ApiResponse({ status: 200, description: 'Agent pool details retrieved successfully', type: AgentPoolDetailsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pool not found' })
  async getAgentPoolDetails(@Param('poolId') poolId: string): Promise<AgentPoolDetailsDto> {
    return this.coordinationService.getAgentPoolDetails(poolId);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a new task allocation' })
  @ApiResponse({ status: 201, description: 'Task allocation created successfully', type: TaskAllocationInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pool not found' })
  async createTaskAllocation(@Body() params: CreateTaskAllocationDto): Promise<TaskAllocationInfoDto> {
    return this.coordinationService.createTaskAllocation(params);
  }

  @Get('tasks/:taskId')
  @ApiOperation({ summary: 'Get task allocation details' })
  @ApiResponse({ status: 200, description: 'Task allocation details retrieved successfully', type: TaskAllocationDetailsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskAllocationDetails(@Param('taskId') taskId: string): Promise<TaskAllocationDetailsDto> {
    return this.coordinationService.getTaskAllocationDetails(taskId);
  }

  @Post('tasks/results')
  @ApiOperation({ summary: 'Submit task result' })
  @ApiResponse({ status: 200, description: 'Task result submitted successfully', type: TaskAllocationInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async submitTaskResult(@Body() params: SubmitTaskResultDto): Promise<TaskAllocationInfoDto> {
    return this.coordinationService.submitTaskResult(params);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new collaboration session' })
  @ApiResponse({ status: 201, description: 'Collaboration session created successfully', type: CollaborationSessionInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pool not found' })
  async createCollaborationSession(@Body() params: CreateCollaborationSessionDto): Promise<CollaborationSessionInfoDto> {
    return this.coordinationService.createCollaborationSession(params);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get collaboration session details' })
  @ApiResponse({ status: 200, description: 'Collaboration session details retrieved successfully', type: CollaborationSessionDetailsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getCollaborationSessionDetails(@Param('sessionId') sessionId: string): Promise<CollaborationSessionDetailsDto> {
    return this.coordinationService.getCollaborationSessionDetails(sessionId);
  }
}
