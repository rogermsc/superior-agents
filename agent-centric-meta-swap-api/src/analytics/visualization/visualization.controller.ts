import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  VisualizationService, 
  RewardVisualizationParamsDto,
  RewardVisualizationDto,
  LearningVisualizationParamsDto,
  LearningVisualizationDto,
  BenchmarkVisualizationParamsDto,
  BenchmarkVisualizationDto,
  DecisionVisualizationParamsDto,
  DecisionVisualizationDto,
  AnomalyVisualizationParamsDto,
  AnomalyVisualizationDto
} from './visualization.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('analytics-visualization')
@Controller('analytics/visualization')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class VisualizationController {
  constructor(private readonly visualizationService: VisualizationService) {}

  @Post('reward')
  @ApiOperation({ summary: 'Generate reward history visualization' })
  @ApiResponse({ status: 200, description: 'Visualization generated successfully', type: RewardVisualizationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateRewardVisualization(@Body() params: RewardVisualizationParamsDto): Promise<RewardVisualizationDto> {
    return this.visualizationService.generateRewardVisualization(params);
  }

  @Post('learning')
  @ApiOperation({ summary: 'Generate learning metrics visualization' })
  @ApiResponse({ status: 200, description: 'Visualization generated successfully', type: LearningVisualizationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateLearningVisualization(@Body() params: LearningVisualizationParamsDto): Promise<LearningVisualizationDto> {
    return this.visualizationService.generateLearningVisualization(params);
  }

  @Post('benchmark')
  @ApiOperation({ summary: 'Generate benchmark comparison visualization' })
  @ApiResponse({ status: 200, description: 'Visualization generated successfully', type: BenchmarkVisualizationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateBenchmarkVisualization(@Body() params: BenchmarkVisualizationParamsDto): Promise<BenchmarkVisualizationDto> {
    return this.visualizationService.generateBenchmarkVisualization(params);
  }

  @Post('decision')
  @ApiOperation({ summary: 'Generate decision process visualization' })
  @ApiResponse({ status: 200, description: 'Visualization generated successfully', type: DecisionVisualizationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateDecisionVisualization(@Body() params: DecisionVisualizationParamsDto): Promise<DecisionVisualizationDto> {
    return this.visualizationService.generateDecisionVisualization(params);
  }

  @Post('anomaly')
  @ApiOperation({ summary: 'Generate anomaly detection visualization' })
  @ApiResponse({ status: 200, description: 'Visualization generated successfully', type: AnomalyVisualizationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateAnomalyVisualization(@Body() params: AnomalyVisualizationParamsDto): Promise<AnomalyVisualizationDto> {
    return this.visualizationService.generateAnomalyVisualization(params);
  }
}
