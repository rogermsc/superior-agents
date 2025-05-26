import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  TelemetryService, 
  ActionTelemetryDto, 
  ObservationTelemetryDto,
  RewardTelemetryDto,
  LearningTelemetryDto,
  TelemetryRecordDto,
  AgentTelemetrySummaryDto,
  TelemetryQueryParamsDto,
  TelemetryRecordsDto,
  RewardHistoryQueryParamsDto,
  RewardHistoryDto,
  LearningMetricsQueryParamsDto,
  LearningMetricsDto
} from './telemetry.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('analytics-telemetry')
@Controller('analytics/telemetry')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('action')
  @ApiOperation({ summary: 'Record agent action telemetry' })
  @ApiResponse({ status: 201, description: 'Telemetry recorded successfully', type: TelemetryRecordDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordActionTelemetry(@Body() params: ActionTelemetryDto): Promise<TelemetryRecordDto> {
    return this.telemetryService.recordActionTelemetry(params);
  }

  @Post('observation')
  @ApiOperation({ summary: 'Record agent observation telemetry' })
  @ApiResponse({ status: 201, description: 'Telemetry recorded successfully', type: TelemetryRecordDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordObservationTelemetry(@Body() params: ObservationTelemetryDto): Promise<TelemetryRecordDto> {
    return this.telemetryService.recordObservationTelemetry(params);
  }

  @Post('reward')
  @ApiOperation({ summary: 'Record agent reward telemetry' })
  @ApiResponse({ status: 201, description: 'Telemetry recorded successfully', type: TelemetryRecordDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordRewardTelemetry(@Body() params: RewardTelemetryDto): Promise<TelemetryRecordDto> {
    return this.telemetryService.recordRewardTelemetry(params);
  }

  @Post('learning')
  @ApiOperation({ summary: 'Record agent learning telemetry' })
  @ApiResponse({ status: 201, description: 'Telemetry recorded successfully', type: TelemetryRecordDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordLearningTelemetry(@Body() params: LearningTelemetryDto): Promise<TelemetryRecordDto> {
    return this.telemetryService.recordLearningTelemetry(params);
  }

  @Get('summary/:agentId')
  @ApiOperation({ summary: 'Get agent telemetry summary' })
  @ApiResponse({ status: 200, description: 'Telemetry summary retrieved successfully', type: AgentTelemetrySummaryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentTelemetrySummary(@Param('agentId') agentId: string): Promise<AgentTelemetrySummaryDto> {
    return this.telemetryService.getAgentTelemetrySummary(agentId);
  }

  @Get('records/:agentId')
  @ApiOperation({ summary: 'Get agent telemetry records' })
  @ApiResponse({ status: 200, description: 'Telemetry records retrieved successfully', type: TelemetryRecordsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentTelemetryRecords(
    @Param('agentId') agentId: string,
    @Query() params: TelemetryQueryParamsDto
  ): Promise<TelemetryRecordsDto> {
    return this.telemetryService.getAgentTelemetryRecords(agentId, params);
  }

  @Get('rewards/:agentId')
  @ApiOperation({ summary: 'Get agent reward history' })
  @ApiResponse({ status: 200, description: 'Reward history retrieved successfully', type: RewardHistoryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentRewardHistory(
    @Param('agentId') agentId: string,
    @Query() params: RewardHistoryQueryParamsDto
  ): Promise<RewardHistoryDto> {
    return this.telemetryService.getAgentRewardHistory(agentId, params);
  }

  @Get('learning/:agentId')
  @ApiOperation({ summary: 'Get agent learning metrics' })
  @ApiResponse({ status: 200, description: 'Learning metrics retrieved successfully', type: LearningMetricsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentLearningMetrics(
    @Param('agentId') agentId: string,
    @Query() params: LearningMetricsQueryParamsDto
  ): Promise<LearningMetricsDto> {
    return this.telemetryService.getAgentLearningMetrics(agentId, params);
  }
}
