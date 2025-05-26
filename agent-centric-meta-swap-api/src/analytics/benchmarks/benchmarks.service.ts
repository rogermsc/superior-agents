import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for benchmarking agent performance
 * Provides standardized tests and comparative analysis
 */
@Injectable()
export class BenchmarksService {
  // In-memory store for benchmark data
  // In a production environment, this would use a database
  private benchmarkStore: Map<string, BenchmarkData> = new Map();
  private benchmarkResultsStore: Map<string, BenchmarkResultData> = new Map();

  constructor(private configService: ConfigService) {
    // Initialize standard benchmarks
    this.initializeStandardBenchmarks();
  }

  /**
   * Get available benchmarks
   * @returns List of available benchmarks
   */
  async getAvailableBenchmarks(): Promise<BenchmarkListDto> {
    const benchmarks = Array.from(this.benchmarkStore.values()).map(benchmark => ({
      benchmarkId: benchmark.benchmarkId,
      name: benchmark.name,
      description: benchmark.description,
      category: benchmark.category,
      difficulty: benchmark.difficulty,
      metrics: benchmark.metrics,
    }));
    
    return { benchmarks };
  }
  
  /**
   * Get benchmark details
   * @param benchmarkId The benchmark's unique identifier
   * @returns Benchmark details
   */
  async getBenchmarkDetails(benchmarkId: string): Promise<BenchmarkDetailsDto> {
    // Get benchmark data
    const benchmark = this.getBenchmarkData(benchmarkId);
    
    return {
      benchmarkId: benchmark.benchmarkId,
      name: benchmark.name,
      description: benchmark.description,
      category: benchmark.category,
      difficulty: benchmark.difficulty,
      metrics: benchmark.metrics,
      scenarios: benchmark.scenarios,
      parameters: benchmark.parameters,
      baselineResults: benchmark.baselineResults,
    };
  }
  
  /**
   * Start a benchmark run
   * @param params Benchmark run parameters
   * @returns Benchmark run information
   */
  async startBenchmarkRun(params: StartBenchmarkRunDto): Promise<BenchmarkRunInfoDto> {
    // Get benchmark data
    const benchmark = this.getBenchmarkData(params.benchmarkId);
    
    // Generate run ID
    const runId = this.generateRunId();
    
    // Create benchmark run data
    const runData: BenchmarkRunData = {
      runId,
      benchmarkId: params.benchmarkId,
      agentId: params.agentId,
      startTime: new Date().toISOString(),
      status: 'running',
      progress: 0,
      currentScenario: 0,
      totalScenarios: benchmark.scenarios.length,
      parameters: params.parameters || {},
      results: [],
    };
    
    // Store benchmark run data
    this.benchmarkResultsStore.set(runId, {
      runData,
      scenarioResults: [],
    });
    
    // Return benchmark run information
    return {
      runId,
      benchmarkId: params.benchmarkId,
      agentId: params.agentId,
      startTime: runData.startTime,
      status: runData.status,
      progress: runData.progress,
      totalScenarios: runData.totalScenarios,
    };
  }
  
  /**
   * Update benchmark run progress
   * @param params Benchmark run update parameters
   * @returns Updated benchmark run information
   */
  async updateBenchmarkRun(params: UpdateBenchmarkRunDto): Promise<BenchmarkRunInfoDto> {
    // Get benchmark result data
    const benchmarkResult = this.getBenchmarkResultData(params.runId);
    
    // Update run data
    benchmarkResult.runData.progress = params.progress;
    benchmarkResult.runData.currentScenario = params.currentScenario;
    
    // Add scenario result if provided
    if (params.scenarioResult) {
      benchmarkResult.scenarioResults.push(params.scenarioResult);
    }
    
    // Check if benchmark is complete
    if (params.progress >= 100) {
      benchmarkResult.runData.status = 'completed';
      benchmarkResult.runData.endTime = new Date().toISOString();
      
      // Calculate final results
      benchmarkResult.runData.results = this.calculateBenchmarkResults(
        params.runId,
        benchmarkResult.runData.benchmarkId,
        benchmarkResult.scenarioResults
      );
    }
    
    // Return updated benchmark run information
    return {
      runId: params.runId,
      benchmarkId: benchmarkResult.runData.benchmarkId,
      agentId: benchmarkResult.runData.agentId,
      startTime: benchmarkResult.runData.startTime,
      endTime: benchmarkResult.runData.endTime,
      status: benchmarkResult.runData.status,
      progress: benchmarkResult.runData.progress,
      totalScenarios: benchmarkResult.runData.totalScenarios,
    };
  }
  
  /**
   * Get benchmark run results
   * @param runId The benchmark run's unique identifier
   * @returns Benchmark run results
   */
  async getBenchmarkRunResults(runId: string): Promise<BenchmarkRunResultsDto> {
    // Get benchmark result data
    const benchmarkResult = this.getBenchmarkResultData(runId);
    
    // Get benchmark data
    const benchmark = this.getBenchmarkData(benchmarkResult.runData.benchmarkId);
    
    // Return benchmark run results
    return {
      runId,
      benchmarkId: benchmarkResult.runData.benchmarkId,
      benchmarkName: benchmark.name,
      agentId: benchmarkResult.runData.agentId,
      startTime: benchmarkResult.runData.startTime,
      endTime: benchmarkResult.runData.endTime,
      status: benchmarkResult.runData.status,
      progress: benchmarkResult.runData.progress,
      parameters: benchmarkResult.runData.parameters,
      results: benchmarkResult.runData.results,
      scenarioResults: benchmarkResult.scenarioResults,
    };
  }
  
  /**
   * Compare benchmark results
   * @param params Benchmark comparison parameters
   * @returns Benchmark comparison results
   */
  async compareBenchmarkResults(params: CompareBenchmarkResultsDto): Promise<BenchmarkComparisonDto> {
    // Get benchmark result data for each run
    const results = params.runIds.map(runId => {
      const benchmarkResult = this.getBenchmarkResultData(runId);
      return {
        runId,
        benchmarkId: benchmarkResult.runData.benchmarkId,
        agentId: benchmarkResult.runData.agentId,
        results: benchmarkResult.runData.results,
      };
    });
    
    // Check if all runs are for the same benchmark
    const benchmarkId = results[0].benchmarkId;
    const sameBenchmark = results.every(result => result.benchmarkId === benchmarkId);
    
    if (!sameBenchmark) {
      throw new Error('Cannot compare results from different benchmarks');
    }
    
    // Get benchmark data
    const benchmark = this.getBenchmarkData(benchmarkId);
    
    // Calculate comparison for each metric
    const metricComparisons = benchmark.metrics.map(metric => {
      const metricResults = results.map(result => {
        const metricResult = result.results.find(r => r.metric === metric.id);
        return {
          runId: result.runId,
          agentId: result.agentId,
          value: metricResult ? metricResult.value : null,
        };
      });
      
      return {
        metric: metric.id,
        name: metric.name,
        description: metric.description,
        higherIsBetter: metric.higherIsBetter,
        results: metricResults,
      };
    });
    
    // Return benchmark comparison
    return {
      benchmarkId,
      benchmarkName: benchmark.name,
      runIds: params.runIds,
      metricComparisons,
    };
  }
  
  /**
   * Get agent benchmark history
   * @param agentId The agent's unique identifier
   * @returns Agent benchmark history
   */
  async getAgentBenchmarkHistory(agentId: string): Promise<AgentBenchmarkHistoryDto> {
    // Find all benchmark runs for the agent
    const agentRuns = Array.from(this.benchmarkResultsStore.values())
      .filter(result => result.runData.agentId === agentId)
      .map(result => ({
        runId: result.runData.runId,
        benchmarkId: result.runData.benchmarkId,
        startTime: result.runData.startTime,
        endTime: result.runData.endTime,
        status: result.runData.status,
        progress: result.runData.progress,
      }));
    
    // Group runs by benchmark
    const benchmarkRuns = {};
    agentRuns.forEach(run => {
      if (!benchmarkRuns[run.benchmarkId]) {
        benchmarkRuns[run.benchmarkId] = [];
      }
      benchmarkRuns[run.benchmarkId].push(run);
    });
    
    // Get benchmark names
    const benchmarkNames = {};
    Object.keys(benchmarkRuns).forEach(benchmarkId => {
      try {
        const benchmark = this.getBenchmarkData(benchmarkId);
        benchmarkNames[benchmarkId] = benchmark.name;
      } catch (error) {
        benchmarkNames[benchmarkId] = 'Unknown Benchmark';
      }
    });
    
    // Return agent benchmark history
    return {
      agentId,
      totalRuns: agentRuns.length,
      benchmarks: Object.keys(benchmarkRuns).map(benchmarkId => ({
        benchmarkId,
        name: benchmarkNames[benchmarkId],
        runs: benchmarkRuns[benchmarkId],
      })),
    };
  }
  
  /**
   * Get benchmark data
   * @param benchmarkId The benchmark's unique identifier
   * @returns Benchmark data
   * @throws Error if benchmark not found
   */
  private getBenchmarkData(benchmarkId: string): BenchmarkData {
    const benchmarkData = this.benchmarkStore.get(benchmarkId);
    if (!benchmarkData) {
      throw new Error(`Benchmark not found: ${benchmarkId}`);
    }
    return benchmarkData;
  }
  
  /**
   * Get benchmark result data
   * @param runId The benchmark run's unique identifier
   * @returns Benchmark result data
   * @throws Error if benchmark run not found
   */
  private getBenchmarkResultData(runId: string): BenchmarkResultData {
    const benchmarkResultData = this.benchmarkResultsStore.get(runId);
    if (!benchmarkResultData) {
      throw new Error(`Benchmark run not found: ${runId}`);
    }
    return benchmarkResultData;
  }
  
  /**
   * Calculate benchmark results
   * @param runId The benchmark run's unique identifier
   * @param benchmarkId The benchmark's unique identifier
   * @param scenarioResults Scenario results
   * @returns Benchmark results
   */
  private calculateBenchmarkResults(runId: string, benchmarkId: string, scenarioResults: BenchmarkScenarioResultDto[]): BenchmarkMetricResultDto[] {
    // Get benchmark data
    const benchmark = this.getBenchmarkData(benchmarkId);
    
    // Calculate results for each metric
    return benchmark.metrics.map(metric => {
      // Extract metric values from scenario results
      const metricValues = scenarioResults
        .filter(result => result.metrics[metric.id] !== undefined)
        .map(result => result.metrics[metric.id]);
      
      // Calculate average value
      const averageValue = metricValues.length > 0
        ? metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length
        : null;
      
      // Calculate percentile rank compared to baseline
      const baselineValue = benchmark.baselineResults.find(result => result.metric === metric.id)?.value;
      let percentileRank = null;
      
      if (baselineValue !== undefined && averageValue !== null) {
        // Calculate percentile rank
        // Higher is better: (value - baseline) / baseline
        // Lower is better: (baseline - value) / baseline
        const difference = metric.higherIsBetter
          ? (averageValue - baselineValue) / Math.abs(baselineValue)
          : (baselineValue - averageValue) / Math.abs(baselineValue);
        
        percentileRank = Math.min(100, Math.max(0, 50 + difference * 50));
      }
      
      return {
        metric: metric.id,
        value: averageValue,
        baselineValue,
        percentileRank,
        rawValues: metricValues,
      };
    });
  }
  
  /**
   * Initialize standard benchmarks
   */
  private initializeStandardBenchmarks(): void {
    // Market Efficiency Benchmark
    this.benchmarkStore.set('benchmark_market_efficiency', {
      benchmarkId: 'benchmark_market_efficiency',
      name: 'Market Efficiency Benchmark',
      description: 'Measures how efficiently an agent can execute trades across different market conditions',
      category: 'trading',
      difficulty: 'medium',
      metrics: [
        {
          id: 'execution_efficiency',
          name: 'Execution Efficiency',
          description: 'Ratio of actual execution price to best available price',
          higherIsBetter: true,
        },
        {
          id: 'slippage',
          name: 'Slippage',
          description: 'Average price slippage as a percentage',
          higherIsBetter: false,
        },
        {
          id: 'time_to_execution',
          name: 'Time to Execution',
          description: 'Average time from decision to execution in milliseconds',
          higherIsBetter: false,
        },
      ],
      scenarios: [
        {
          id: 'normal_market',
          name: 'Normal Market Conditions',
          description: 'Standard market with moderate volatility',
          weight: 0.4,
        },
        {
          id: 'high_volatility',
          name: 'High Volatility Market',
          description: 'Market with rapid price movements',
          weight: 0.3,
        },
        {
          id: 'low_liquidity',
          name: 'Low Liquidity Market',
          description: 'Market with reduced depth and wider spreads',
          weight: 0.3,
        },
      ],
      parameters: [
        {
          id: 'trade_size',
          name: 'Trade Size',
          description: 'Size of trades to execute',
          type: 'number',
          default: 1.0,
        },
        {
          id: 'max_slippage',
          name: 'Maximum Slippage',
          description: 'Maximum acceptable slippage percentage',
          type: 'number',
          default: 0.5,
        },
      ],
      baselineResults: [
        {
          metric: 'execution_efficiency',
          value: 0.95,
        },
        {
          metric: 'slippage',
          value: 0.3,
        },
        {
          metric: 'time_to_execution',
          value: 500,
        },
      ],
    });
    
    // Profit Optimization Benchmark
    this.benchmarkStore.set('benchmark_profit_optimization', {
      benchmarkId: 'benchmark_profit_optimization',
      name: 'Profit Optimization Benchmark',
      description: 'Evaluates an agent\'s ability to maximize profits while managing risk',
      category: 'trading',
      difficulty: 'hard',
      metrics: [
        {
          id: 'total_return',
          name: 'Total Return',
          description: 'Percentage return on investment',
          higherIsBetter: true,
        },
        {
          id: 'sharpe_ratio',
          name: 'Sharpe Ratio',
          description: 'Risk-adjusted return metric',
          higherIsBetter: true,
        },
        {
          id: 'max_drawdown',
          name: 'Maximum Drawdown',
          description: 'Largest percentage drop from peak to trough',
          higherIsBetter: false,
        },
        {
          id: 'win_rate',
          name: 'Win Rate',
          description: 'Percentage of profitable trades',
          higherIsBetter: true,
        },
      ],
      scenarios: [
        {
          id: 'bull_market',
          name: 'Bull Market',
          description: 'Upward trending market',
          weight: 0.25,
        },
        {
          id: 'bear_market',
          name: 'Bear Market',
          description: 'Downward trending market',
          weight: 0.25,
        },
        {
          id: 'sideways_market',
          name: 'Sideways Market',
          description: 'Range-bound market with no clear trend',
          weight: 0.25,
        },
        {
          id: 'market_crash',
          name: 'Market Crash',
          description: 'Sudden sharp decline in prices',
          weight: 0.25,
        },
      ],
      parameters: [
        {
          id: 'initial_capital',
          name: 'Initial Capital',
          description: 'Starting capital amount',
          type: 'number',
          default: 10000,
        },
        {
          id: 'max_position_size',
          name: 'Maximum Position Size',
          description: 'Maximum percentage of capital for a single position',
          type: 'number',
          default: 0.2,
        },
        {
          id: 'trading_period',
          name: 'Trading Period',
          description: 'Duration of trading period in days',
          type: 'number',
          default: 30,
        },
      ],
      baselineResults: [
        {
          metric: 'total_return',
          value: 5.2,
        },
        {
          metric: 'sharpe_ratio',
          value: 1.1,
        },
        {
          metric: 'max_drawdown',
          value: 12.5,
        },
        {
          metric: 'win_rate',
          value: 52.0,
        },
      ],
    });
    
    // Adaptation Speed Benchmark
    this.benchmarkStore.set('benchmark_adaptation_speed', {
      benchmarkId: 'benchmark_adaptation_speed',
      name: 'Adaptation Speed Benchmark',
      description: 'Measures how quickly an agent can adapt to changing market conditions',
      category: 'learning',
      difficulty: 'expert',
      metrics: [
        {
          id: 'recovery_time',
          name: 'Recovery Time',
          description: 'Time to recover performance after market change in minutes',
          higherIsBetter: false,
        },
        {
          id: 'adaptation_efficiency',
          name: 'Adaptation Efficiency',
          description: 'Percentage of optimal performance achieved after adaptation',
          higherIsBetter: true,
        },
        {
          id: 'stability',
          name: 'Stability',
          description: 'Consistency of performance during adaptation period',
          higherIsBetter: true,
        },
      ],
      scenarios: [
        {
          id: 'regime_change',
          name: 'Market Regime Change',
          description: 'Transition from one market regime to another',
          weight: 0.5,
        },
        {
          id: 'volatility_spike',
          name: 'Volatility Spike',
          description: 'Sudden increase in market volatility',
          weight: 0.25,
        },
        {
          id: 'liquidity_shock',
          name: 'Liquidity Shock',
          description: 'Sudden decrease in market liquidity',
          weight: 0.25,
        },
      ],
      parameters: [
        {
          id: 'change_magnitude',
          name: 'Change Magnitude',
          description: 'Magnitude of market condition change',
          type: 'number',
          default: 0.5,
        },
        {
          id: 'observation_period',
          name: 'Observation Period',
          description: 'Duration of observation period in minutes',
          type: 'number',
          default: 60,
        },
      ],
      baselineResults: [
        {
          metric: 'recovery_time',
          value: 45,
        },
        {
          metric: 'adaptation_efficiency',
          value: 75,
        },
        {
          metric: 'stability',
          value: 0.65,
        },
      ],
    });
  }
  
  /**
   * Generate a unique run ID
   * @returns Unique run ID
   */
  private generateRunId(): string {
    return `run_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
interface BenchmarkData {
  benchmarkId: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  metrics: Array<{
    id: string;
    name: string;
    description: string;
    higherIsBetter: boolean;
  }>;
  scenarios: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
  }>;
  parameters: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    default: any;
  }>;
  baselineResults: Array<{
    metric: string;
    value: number;
  }>;
}

interface BenchmarkRunData {
  runId: string;
  benchmarkId: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  currentScenario: number;
  totalScenarios: number;
  parameters: any;
  results: BenchmarkMetricResultDto[];
}

interface BenchmarkResultData {
  runData: BenchmarkRunData;
  scenarioResults: BenchmarkScenarioResultDto[];
}

// DTOs
export class BenchmarkListDto {
  benchmarks: Array<{
    benchmarkId: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    metrics: Array<{
      id: string;
      name: string;
      description: string;
      higherIsBetter: boolean;
    }>;
  }>;
}

export class BenchmarkDetailsDto {
  benchmarkId: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  metrics: Array<{
    id: string;
    name: string;
    description: string;
    higherIsBetter: boolean;
  }>;
  scenarios: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
  }>;
  parameters: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    default: any;
  }>;
  baselineResults: Array<{
    metric: string;
    value: number;
  }>;
}

export class StartBenchmarkRunDto {
  benchmarkId: string;
  agentId: string;
  parameters?: any;
}

export class UpdateBenchmarkRunDto {
  runId: string;
  progress: number;
  currentScenario: number;
  scenarioResult?: BenchmarkScenarioResultDto;
}

export class BenchmarkScenarioResultDto {
  scenarioId: string;
  startTime: string;
  endTime: string;
  success: boolean;
  metrics: {
    [key: string]: number;
  };
  details?: any;
}

export class BenchmarkRunInfoDto {
  runId: string;
  benchmarkId: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  status: string;
  progress: number;
  totalScenarios: number;
}

export class BenchmarkMetricResultDto {
  metric: string;
  value: number;
  baselineValue?: number;
  percentileRank?: number;
  rawValues: number[];
}

export class BenchmarkRunResultsDto {
  runId: string;
  benchmarkId: string;
  benchmarkName: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  status: string;
  progress: number;
  parameters: any;
  results: BenchmarkMetricResultDto[];
  scenarioResults: BenchmarkScenarioResultDto[];
}

export class CompareBenchmarkResultsDto {
  runIds: string[];
}

export class BenchmarkComparisonDto {
  benchmarkId: string;
  benchmarkName: string;
  runIds: string[];
  metricComparisons: Array<{
    metric: string;
    name: string;
    description: string;
    higherIsBetter: boolean;
    results: Array<{
      runId: string;
      agentId: string;
      value: number;
    }>;
  }>;
}

export class AgentBenchmarkHistoryDto {
  agentId: string;
  totalRuns: number;
  benchmarks: Array<{
    benchmarkId: string;
    name: string;
    runs: Array<{
      runId: string;
      startTime: string;
      endTime?: string;
      status: string;
      progress: number;
    }>;
  }>;
}
