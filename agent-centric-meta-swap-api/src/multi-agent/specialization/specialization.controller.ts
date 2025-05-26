import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  SpecializationService, 
  CreateSpecializationDto,
  SpecializationInfoDto,
  GetSpecializationDetailsDto,
  SpecializationDetailsDto,
  RegisterAgentSpecializationDto,
  AgentSpecializationInfoDto,
  UpdateAgentProficiencyDto,
  GetAgentSpecializationDetailsDto,
  AgentSpecializationDetailsDto,
  FindSpecializedAgentsDto,
  SpecializedAgentsDto,
  GetAgentSpecializationsDto,
  AgentSpecializationsDto
} from './specialization.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('multi-agent-specialization')
@Controller('multi-agent/specialization')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  @Post('domains')
  @ApiOperation({ summary: 'Create a new specialization domain' })
  @ApiResponse({ status: 201, description: 'Specialization domain created successfully', type: SpecializationInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSpecialization(@Body() params: CreateSpecializationDto): Promise<SpecializationInfoDto> {
    return this.specializationService.createSpecialization(params);
  }

  @Get('domains/:specializationId')
  @ApiOperation({ summary: 'Get specialization details' })
  @ApiResponse({ status: 200, description: 'Specialization details retrieved successfully', type: SpecializationDetailsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Specialization not found' })
  async getSpecializationDetails(
    @Param('specializationId') specializationId: string
  ): Promise<SpecializationDetailsDto> {
    return this.specializationService.getSpecializationDetails({ specializationId });
  }

  @Post('agents')
  @ApiOperation({ summary: 'Register agent specialization' })
  @ApiResponse({ status: 201, description: 'Agent specialization registered successfully', type: AgentSpecializationInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Specialization not found' })
  async registerAgentSpecialization(@Body() params: RegisterAgentSpecializationDto): Promise<AgentSpecializationInfoDto> {
    return this.specializationService.registerAgentSpecialization(params);
  }

  @Post('agents/:agentSpecializationId/proficiency')
  @ApiOperation({ summary: 'Update agent proficiency' })
  @ApiResponse({ status: 200, description: 'Agent proficiency updated successfully', type: AgentSpecializationInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent specialization not found' })
  async updateAgentProficiency(
    @Param('agentSpecializationId') agentSpecializationId: string,
    @Body() params: Omit<UpdateAgentProficiencyDto, 'agentSpecializationId'>
  ): Promise<AgentSpecializationInfoDto> {
    return this.specializationService.updateAgentProficiency({ ...params, agentSpecializationId });
  }

  @Get('agents/:agentSpecializationId')
  @ApiOperation({ summary: 'Get agent specialization details' })
  @ApiResponse({ status: 200, description: 'Agent specialization details retrieved successfully', type: AgentSpecializationDetailsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent specialization not found' })
  async getAgentSpecializationDetails(
    @Param('agentSpecializationId') agentSpecializationId: string
  ): Promise<AgentSpecializationDetailsDto> {
    return this.specializationService.getAgentSpecializationDetails({ agentSpecializationId });
  }

  @Get('domains/:specializationId/agents')
  @ApiOperation({ summary: 'Find specialized agents' })
  @ApiResponse({ status: 200, description: 'Specialized agents retrieved successfully', type: SpecializedAgentsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Specialization not found' })
  async findSpecializedAgents(
    @Param('specializationId') specializationId: string,
    @Query() params: Omit<FindSpecializedAgentsDto, 'specializationId'>
  ): Promise<SpecializedAgentsDto> {
    return this.specializationService.findSpecializedAgents({ ...params, specializationId });
  }

  @Get('agents/:agentId/specializations')
  @ApiOperation({ summary: 'Get agent specializations' })
  @ApiResponse({ status: 200, description: 'Agent specializations retrieved successfully', type: AgentSpecializationsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAgentSpecializations(
    @Param('agentId') agentId: string
  ): Promise<AgentSpecializationsDto> {
    return this.specializationService.getAgentSpecializations({ agentId });
  }
}
