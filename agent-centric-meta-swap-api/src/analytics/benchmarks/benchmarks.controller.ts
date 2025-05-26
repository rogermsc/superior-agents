import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  BenchmarksService, 
  BenchmarkListDto,
  BenchmarkDetailsDto,
  StartBenchmarkRunDto,
  UpdateBenchmarkRunDto,
  BenchmarkRunInfoDto,
  BenchmarkRunResultsDto,
  CompareBenchmarkResultsDto,
  BenchmarkComparisonDto,
  AgentBenchmarkHistoryDto
} from './benchmarks.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('analytics-benchmarks')
@Controller('analytics/benchmarks')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class BenchmarksController {
  constructor(private readonly benchmarksService: BenchmarksService) {}

  @Get()
  @ApiOperation({ summary: 'Get available benchmarks' })
  @ApiResponse({ status: 200, description: 'Benchmarks retrieved successfully', type: BenchmarkListDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAvailableBenchmarks(): Promise<BenchmarkListDto> {
    return this.benchmarksService.getAvailableBenchmarks();
  }

  @Get(':benchmarkId')
  @ApiOperation({ summary: 'Get benchmark details' })
  @ApiResponse({ status: 200, description: 'Benchmark details retrieved successfully', type: BenchmarkDetailsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Benchmark not found' })
  async getBenchmarkDetails(@Param('benchmarkId') benchmarkId: string): Promise<BenchmarkDetailsDto> {
    return this.benchmarksService.getBenchmarkDetails(benchmarkId);
  }

  @Post('run')
  @ApiOperation({ summary: 'Start a benchmark run' })
  @ApiResponse({ status: 201, description: 'Benchmark run started successfully', type: BenchmarkRunInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Benchmark not found' })
  async startBenchmarkRun(@Body() params: StartBenchmarkRunDto): Promise<BenchmarkRunInfoDto> {
    return this.benchmarksService.startBenchmarkRun(params);
  }

  @Post('run/update')
  @ApiOperation({ summary: 'Update benchmark run progress' })
  @ApiResponse({ status: 200, description: 'Benchmark run updated successfully', type: BenchmarkRunInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Benchmark run not found' })
  async updateBenchmarkRun(@Body() params: UpdateBenchmarkRunDto): Promise<BenchmarkRunInfoDto> {
    return this.benchmarksService.updateBenchmarkRun(params);
  }

  @Get('run/:runId')
  @ApiOperation({ summary: 'Get benchmark run results' })
  @ApiResponse({ status: 200, description: 'Benchmark run results retrieved successfully', type: BenchmarkRunResultsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Benchmark run not found' })
  async getBenchmarkRunResults(@Param('runId') runId: string): Promise<BenchmarkRunResultsDto> {
    return this.benchmarksService.getBenchmarkRunResults(runId);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare benchmark results' })
  @ApiResponse({ status: 200, description: 'Benchmark comparison retrieved successfully', type: BenchmarkComparisonDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid comparison parameters' })
  async compareBenchmarkResults(@Body() params: CompareBenchmarkResultsDto): Promise<BenchmarkComparisonDto> {
    return this.benchmarksService.compareBenchmarkResults(params);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get agent benchmark history' })
  @ApiResponse({ status: 200, description: 'Agent benchmark history retrieved successfully', type: AgentBenchmarkHistoryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAgentBenchmarkHistory(@Param('agentId') agentId: string): Promise<AgentBenchmarkHistoryDto> {
    return this.benchmarksService.getAgentBenchmarkHistory(agentId);
  }
}
