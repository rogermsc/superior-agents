import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for collecting and managing agent performance telemetry
 * Provides comprehensive data collection for agent learning analysis
 */
@Injectable()
export class TelemetryService {
  // In-memory store for telemetry data
  // In a production environment, this would use a time-series database
  private telemetryStore: Map<string, AgentTelemetryData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Record agent action telemetry
   * @param params Telemetry data for an agent action
   * @returns Recorded telemetry information
   */
  async recordActionTelemetry(params: ActionTelemetryDto): Promise<TelemetryRecordDto> {
    // Get or create agent telemetry data
    const telemetryData = this.getOrCreateTelemetryData(params.agentId);
    
    // Create telemetry record
    const record: TelemetryRecord = {
      recordId: this.generateRecordId(),
      timestamp: new Date().toISOString(),
      type: 'action',
      data: {
        actionId: params.actionId,
        actionType: params.actionType,
        context: params.context,
        parameters: params.parameters,
        result: params.result,
        metrics: {
          executionTimeMs: params.executionTimeMs,
          success: params.success,
          errorType: params.errorType,
          ...params.customMetrics,
        },
      },
      metadata: {
        simulationId: params.simulationId,
        environmentType: params.environmentType || 'production',
        version: params.version || '1.0.0',
      },
    };
    
    // Add record to telemetry data
    telemetryData.records.push(record);
    
    // Update agent statistics
    this.updateAgentStatistics(telemetryData, record);
    
    // Return telemetry record information
    return {
      recordId: record.recordId,
      agentId: params.agentId,
      timestamp: record.timestamp,
      type: record.type,
    };
  }
  
  /**
   * Record agent observation telemetry
   * @param params Telemetry data for an agent observation
   * @returns Recorded telemetry information
   */
  async recordObservationTelemetry(params: ObservationTelemetryDto): Promise<TelemetryRecordDto> {
    // Get or create agent telemetry data
    const telemetryData = this.getOrCreateTelemetryData(params.agentId);
    
    // Create telemetry record
    const record: TelemetryRecord = {
      recordId: this.generateRecordId(),
      timestamp: new Date().toISOString(),
      type: 'observation',
      data: {
        observationType: params.observationType,
        features: params.features,
        metrics: {
          processingTimeMs: params.processingTimeMs,
          featureCount: params.featureCount,
          dataQuality: params.dataQuality,
          ...params.customMetrics,
        },
      },
      metadata: {
        simulationId: params.simulationId,
        environmentType: params.environmentType || 'production',
        version: params.version || '1.0.0',
      },
    };
    
    // Add record to telemetry data
    telemetryData.records.push(record);
    
    // Update agent statistics
    this.updateAgentStatistics(telemetryData, record);
    
    // Return telemetry record information
    return {
      recordId: record.recordId,
      agentId: params.agentId,
      timestamp: record.timestamp,
      type: record.type,
    };
  }
  
  /**
   * Record agent reward telemetry
   * @param params Telemetry data for an agent reward
   * @returns Recorded telemetry information
   */
  async recordRewardTelemetry(params: RewardTelemetryDto): Promise<TelemetryRecordDto> {
    // Get or create agent telemetry data
    const telemetryData = this.getOrCreateTelemetryData(params.agentId);
    
    // Create telemetry record
    const record: TelemetryRecord = {
      recordId: this.generateRecordId(),
      timestamp: new Date().toISOString(),
      type: 'reward',
      data: {
        actionId: params.actionId,
        rewardValue: params.rewardValue,
        rewardComponents: params.rewardComponents,
        metrics: {
          cumulativeReward: telemetryData.statistics.cumulativeReward + params.rewardValue,
          ...params.customMetrics,
        },
      },
      metadata: {
        simulationId: params.simulationId,
        environmentType: params.environmentType || 'production',
        version: params.version || '1.0.0',
      },
    };
    
    // Add record to telemetry data
    telemetryData.records.push(record);
    
    // Update agent statistics
    telemetryData.statistics.cumulativeReward += params.rewardValue;
    telemetryData.statistics.rewardCount++;
    telemetryData.statistics.averageReward = telemetryData.statistics.cumulativeReward / telemetryData.statistics.rewardCount;
    
    // Update reward history
    telemetryData.rewardHistory.push({
      timestamp: record.timestamp,
      value: params.rewardValue,
    });
    
    // Return telemetry record information
    return {
      recordId: record.recordId,
      agentId: params.agentId,
      timestamp: record.timestamp,
      type: record.type,
    };
  }
  
  /**
   * Record agent learning telemetry
   * @param params Telemetry data for agent learning
   * @returns Recorded telemetry information
   */
  async recordLearningTelemetry(params: LearningTelemetryDto): Promise<TelemetryRecordDto> {
    // Get or create agent telemetry data
    const telemetryData = this.getOrCreateTelemetryData(params.agentId);
    
    // Create telemetry record
    const record: TelemetryRecord = {
      recordId: this.generateRecordId(),
      timestamp: new Date().toISOString(),
      type: 'learning',
      data: {
        learningPhase: params.learningPhase,
        modelUpdate: params.modelUpdate,
        metrics: {
          lossValue: params.lossValue,
          accuracyValue: params.accuracyValue,
          explorationRate: params.explorationRate,
          learningRate: params.learningRate,
          ...params.customMetrics,
        },
      },
      metadata: {
        simulationId: params.simulationId,
        environmentType: params.environmentType || 'production',
        version: params.version || '1.0.0',
      },
    };
    
    // Add record to telemetry data
    telemetryData.records.push(record);
    
    // Update agent statistics
    telemetryData.statistics.learningUpdates++;
    
    // Update learning metrics history
    if (params.lossValue !== undefined) {
      telemetryData.learningMetrics.loss.push({
        timestamp: record.timestamp,
        value: params.lossValue,
      });
    }
    
    if (params.accuracyValue !== undefined) {
      telemetryData.learningMetrics.accuracy.push({
        timestamp: record.timestamp,
        value: params.accuracyValue,
      });
    }
    
    // Return telemetry record information
    return {
      recordId: record.recordId,
      agentId: params.agentId,
      timestamp: record.timestamp,
      type: record.type,
    };
  }
  
  /**
   * Get agent telemetry summary
   * @param agentId The agent's unique identifier
   * @returns Agent telemetry summary
   */
  async getAgentTelemetrySummary(agentId: string): Promise<AgentTelemetrySummaryDto> {
    // Get agent telemetry data
    const telemetryData = this.getTelemetryData(agentId);
    
    // Calculate additional metrics
    const actionSuccessRate = telemetryData.statistics.actionCount > 0
      ? telemetryData.statistics.actionSuccessCount / telemetryData.statistics.actionCount
      : 0;
    
    // Return telemetry summary
    return {
      agentId,
      recordCount: telemetryData.records.length,
      statistics: {
        ...telemetryData.statistics,
        actionSuccessRate,
      },
      recentActivity: this.getRecentActivity(telemetryData),
      learningProgress: this.calculateLearningProgress(telemetryData),
    };
  }
  
  /**
   * Get agent telemetry records
   * @param agentId The agent's unique identifier
   * @param params Query parameters
   * @returns Agent telemetry records
   */
  async getAgentTelemetryRecords(agentId: string, params: TelemetryQueryParamsDto): Promise<TelemetryRecordsDto> {
    // Get agent telemetry data
    const telemetryData = this.getTelemetryData(agentId);
    
    // Filter records based on query parameters
    let filteredRecords = telemetryData.records;
    
    if (params.type) {
      filteredRecords = filteredRecords.filter(record => record.type === params.type);
    }
    
    if (params.startTime) {
      const startTime = new Date(params.startTime).getTime();
      filteredRecords = filteredRecords.filter(record => new Date(record.timestamp).getTime() >= startTime);
    }
    
    if (params.endTime) {
      const endTime = new Date(params.endTime).getTime();
      filteredRecords = filteredRecords.filter(record => new Date(record.timestamp).getTime() <= endTime);
    }
    
    if (params.simulationId) {
      filteredRecords = filteredRecords.filter(record => record.metadata.simulationId === params.simulationId);
    }
    
    // Sort records by timestamp (newest first)
    filteredRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const limit = params.limit || 100;
    const offset = params.offset || 0;
    const paginatedRecords = filteredRecords.slice(offset, offset + limit);
    
    // Return telemetry records
    return {
      agentId,
      totalCount: filteredRecords.length,
      offset,
      limit,
      records: paginatedRecords,
    };
  }
  
  /**
   * Get agent reward history
   * @param agentId The agent's unique identifier
   * @param params Query parameters
   * @returns Agent reward history
   */
  async getAgentRewardHistory(agentId: string, params: RewardHistoryQueryParamsDto): Promise<RewardHistoryDto> {
    // Get agent telemetry data
    const telemetryData = this.getTelemetryData(agentId);
    
    // Filter reward history based on query parameters
    let filteredHistory = telemetryData.rewardHistory;
    
    if (params.startTime) {
      const startTime = new Date(params.startTime).getTime();
      filteredHistory = filteredHistory.filter(item => new Date(item.timestamp).getTime() >= startTime);
    }
    
    if (params.endTime) {
      const endTime = new Date(params.endTime).getTime();
      filteredHistory = filteredHistory.filter(item => new Date(item.timestamp).getTime() <= endTime);
    }
    
    // Calculate moving average if requested
    let movingAverage = [];
    if (params.movingAverageWindow && params.movingAverageWindow > 0) {
      movingAverage = this.calculateMovingAverage(filteredHistory, params.movingAverageWindow);
    }
    
    // Return reward history
    return {
      agentId,
      totalPoints: filteredHistory.length,
      history: filteredHistory,
      movingAverage,
      cumulativeReward: telemetryData.statistics.cumulativeReward,
      averageReward: telemetryData.statistics.averageReward,
    };
  }
  
  /**
   * Get agent learning metrics
   * @param agentId The agent's unique identifier
   * @param params Query parameters
   * @returns Agent learning metrics
   */
  async getAgentLearningMetrics(agentId: string, params: LearningMetricsQueryParamsDto): Promise<LearningMetricsDto> {
    // Get agent telemetry data
    const telemetryData = this.getTelemetryData(agentId);
    
    // Filter learning metrics based on query parameters
    let filteredLossHistory = telemetryData.learningMetrics.loss;
    let filteredAccuracyHistory = telemetryData.learningMetrics.accuracy;
    
    if (params.startTime) {
      const startTime = new Date(params.startTime).getTime();
      filteredLossHistory = filteredLossHistory.filter(item => new Date(item.timestamp).getTime() >= startTime);
      filteredAccuracyHistory = filteredAccuracyHistory.filter(item => new Date(item.timestamp).getTime() >= startTime);
    }
    
    if (params.endTime) {
      const endTime = new Date(params.endTime).getTime();
      filteredLossHistory = filteredLossHistory.filter(item => new Date(item.timestamp).getTime() <= endTime);
      filteredAccuracyHistory = filteredAccuracyHistory.filter(item => new Date(item.timestamp).getTime() <= endTime);
    }
    
    // Return learning metrics
    return {
      agentId,
      lossHistory: filteredLossHistory,
      accuracyHistory: filteredAccuracyHistory,
      learningUpdates: telemetryData.statistics.learningUpdates,
    };
  }
  
  /**
   * Get or create agent telemetry data
   * @param agentId The agent's unique identifier
   * @returns Agent telemetry data
   */
  private getOrCreateTelemetryData(agentId: string): AgentTelemetryData {
    if (!this.telemetryStore.has(agentId)) {
      this.telemetryStore.set(agentId, {
        records: [],
        statistics: {
          actionCount: 0,
          actionSuccessCount: 0,
          observationCount: 0,
          rewardCount: 0,
          cumulativeReward: 0,
          averageReward: 0,
          learningUpdates: 0,
        },
        rewardHistory: [],
        learningMetrics: {
          loss: [],
          accuracy: [],
        },
      });
    }
    
    return this.telemetryStore.get(agentId);
  }
  
  /**
   * Get agent telemetry data
   * @param agentId The agent's unique identifier
   * @returns Agent telemetry data
   * @throws Error if agent not found
   */
  private getTelemetryData(agentId: string): AgentTelemetryData {
    const telemetryData = this.telemetryStore.get(agentId);
    if (!telemetryData) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return telemetryData;
  }
  
  /**
   * Update agent statistics based on a telemetry record
   * @param telemetryData Agent telemetry data
   * @param record Telemetry record
   */
  private updateAgentStatistics(telemetryData: AgentTelemetryData, record: TelemetryRecord): void {
    // Update statistics based on record type
    switch (record.type) {
      case 'action':
        telemetryData.statistics.actionCount++;
        if (record.data.metrics.success) {
          telemetryData.statistics.actionSuccessCount++;
        }
        break;
      case 'observation':
        telemetryData.statistics.observationCount++;
        break;
      // Reward and learning statistics are updated in their respective methods
    }
  }
  
  /**
   * Get recent activity for an agent
   * @param telemetryData Agent telemetry data
   * @returns Recent activity summary
   */
  private getRecentActivity(telemetryData: AgentTelemetryData): RecentActivityDto {
    // Get the last 24 hours of records
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentRecords = telemetryData.records.filter(
      record => new Date(record.timestamp) >= oneDayAgo
    );
    
    // Count records by type
    const actionCount = recentRecords.filter(record => record.type === 'action').length;
    const observationCount = recentRecords.filter(record => record.type === 'observation').length;
    const rewardCount = recentRecords.filter(record => record.type === 'reward').length;
    const learningCount = recentRecords.filter(record => record.type === 'learning').length;
    
    // Calculate success rate for recent actions
    const recentActions = recentRecords.filter(record => record.type === 'action');
    const successfulActions = recentActions.filter(record => record.data.metrics.success);
    const actionSuccessRate = recentActions.length > 0
      ? successfulActions.length / recentActions.length
      : 0;
    
    // Calculate recent reward statistics
    const recentRewards = recentRecords.filter(record => record.type === 'reward');
    const recentRewardValues = recentRewards.map(record => record.data.rewardValue);
    const recentTotalReward = recentRewardValues.reduce((sum, value) => sum + value, 0);
    const recentAverageReward = recentRewards.length > 0
      ? recentTotalReward / recentRewards.length
      : 0;
    
    return {
      period: '24h',
      counts: {
        action: actionCount,
        observation: observationCount,
        reward: rewardCount,
        learning: learningCount,
      },
      actionSuccessRate,
      recentTotalReward,
      recentAverageReward,
    };
  }
  
  /**
   * Calculate learning progress for an agent
   * @param telemetryData Agent telemetry data
   * @returns Learning progress metrics
   */
  private calculateLearningProgress(telemetryData: AgentTelemetryData): LearningProgressDto {
    // Calculate loss improvement
    const lossHistory = telemetryData.learningMetrics.loss;
    const initialLoss = lossHistory.length > 0 ? lossHistory[0].value : null;
    const currentLoss = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].value : null;
    const lossImprovement = (initialLoss !== null && currentLoss !== null)
      ? (initialLoss - currentLoss) / initialLoss
      : null;
    
    // Calculate accuracy improvement
    const accuracyHistory = telemetryData.learningMetrics.accuracy;
    const initialAccuracy = accuracyHistory.length > 0 ? accuracyHistory[0].value : null;
    const currentAccuracy = accuracyHistory.length > 0 ? accuracyHistory[accuracyHistory.length - 1].value : null;
    const accuracyImprovement = (initialAccuracy !== null && currentAccuracy !== null)
      ? (currentAccuracy - initialAccuracy) / (1 - initialAccuracy)
      : null;
    
    // Calculate reward improvement
    const rewardHistory = telemetryData.rewardHistory;
    if (rewardHistory.length >= 10) {
      // Calculate average of first 5 rewards
      const initialRewards = rewardHistory.slice(0, 5);
      const initialAverage = initialRewards.reduce((sum, item) => sum + item.value, 0) / initialRewards.length;
      
      // Calculate average of last 5 rewards
      const recentRewards = rewardHistory.slice(-5);
      const recentAverage = recentRewards.reduce((sum, item) => sum + item.value, 0) / recentRewards.length;
      
      // Calculate improvement
      const rewardImprovement = (recentAverage - initialAverage) / Math.abs(initialAverage);
      
      return {
        lossValue: currentLoss,
        lossImprovement,
        accuracyValue: currentAccuracy,
        accuracyImprovement,
        rewardImprovement,
        learningUpdates: telemetryData.statistics.learningUpdates,
      };
    }
    
    // Not enough reward data
    return {
      lossValue: currentLoss,
      lossImprovement,
      accuracyValue: currentAccuracy,
      accuracyImprovement,
      rewardImprovement: null,
      learningUpdates: telemetryData.statistics.learningUpdates,
    };
  }
  
  /**
   * Calculate moving average for a time series
   * @param timeSeries Time series data
   * @param windowSize Window size for moving average
   * @returns Moving average time series
   */
  private calculateMovingAverage(timeSeries: Array<{ timestamp: string; value: number }>, windowSize: number): Array<{ timestamp: string; value: number }> {
    if (timeSeries.length < windowSize) {
      return [];
    }
    
    const result = [];
    
    for (let i = windowSize - 1; i < timeSeries.length; i++) {
      const windowValues = timeSeries.slice(i - windowSize + 1, i + 1).map(item => item.value);
      const average = windowValues.reduce((sum, value) => sum + value, 0) / windowSize;
      
      result.push({
        timestamp: timeSeries[i].timestamp,
        value: average,
      });
    }
    
    return result;
  }
  
  /**
   * Generate a unique record ID
   * @returns Unique record ID
   */
  private generateRecordId(): string {
    return `record_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
interface AgentTelemetryData {
  records: TelemetryRecord[];
  statistics: {
    actionCount: number;
    actionSuccessCount: number;
    observationCount: number;
    rewardCount: number;
    cumulativeReward: number;
    averageReward: number;
    learningUpdates: number;
  };
  rewardHistory: Array<{ timestamp: string; value: number }>;
  learningMetrics: {
    loss: Array<{ timestamp: string; value: number }>;
    accuracy: Array<{ timestamp: string; value: number }>;
  };
}

interface TelemetryRecord {
  recordId: string;
  timestamp: string;
  type: 'action' | 'observation' | 'reward' | 'learning';
  data: any;
  metadata: {
    simulationId: string;
    environmentType: string;
    version: string;
    [key: string]: any;
  };
}

// DTOs
export class ActionTelemetryDto {
  agentId: string;
  simulationId: string;
  actionId: string;
  actionType: string;
  context: any;
  parameters: any;
  result: any;
  executionTimeMs: number;
  success: boolean;
  errorType?: string;
  customMetrics?: any;
  environmentType?: string;
  version?: string;
}

export class ObservationTelemetryDto {
  agentId: string;
  simulationId: string;
  observationType: string;
  features: string[];
  processingTimeMs: number;
  featureCount: number;
  dataQuality: string;
  customMetrics?: any;
  environmentType?: string;
  version?: string;
}

export class RewardTelemetryDto {
  agentId: string;
  simulationId: string;
  actionId: string;
  rewardValue: number;
  rewardComponents: any;
  customMetrics?: any;
  environmentType?: string;
  version?: string;
}

export class LearningTelemetryDto {
  agentId: string;
  simulationId: string;
  learningPhase: string;
  modelUpdate: any;
  lossValue?: number;
  accuracyValue?: number;
  explorationRate?: number;
  learningRate?: number;
  customMetrics?: any;
  environmentType?: string;
  version?: string;
}

export class TelemetryRecordDto {
  recordId: string;
  agentId: string;
  timestamp: string;
  type: string;
}

export class TelemetryQueryParamsDto {
  type?: 'action' | 'observation' | 'reward' | 'learning';
  startTime?: string;
  endTime?: string;
  simulationId?: string;
  limit?: number;
  offset?: number;
}

export class RewardHistoryQueryParamsDto {
  startTime?: string;
  endTime?: string;
  movingAverageWindow?: number;
}

export class LearningMetricsQueryParamsDto {
  startTime?: string;
  endTime?: string;
}

export class AgentTelemetrySummaryDto {
  agentId: string;
  recordCount: number;
  statistics: {
    actionCount: number;
    actionSuccessCount: number;
    actionSuccessRate: number;
    observationCount: number;
    rewardCount: number;
    cumulativeReward: number;
    averageReward: number;
    learningUpdates: number;
  };
  recentActivity: RecentActivityDto;
  learningProgress: LearningProgressDto;
}

export class RecentActivityDto {
  period: string;
  counts: {
    action: number;
    observation: number;
    reward: number;
    learning: number;
  };
  actionSuccessRate: number;
  recentTotalReward: number;
  recentAverageReward: number;
}

export class LearningProgressDto {
  lossValue: number;
  lossImprovement: number;
  accuracyValue: number;
  accuracyImprovement: number;
  rewardImprovement: number;
  learningUpdates: number;
}

export class TelemetryRecordsDto {
  agentId: string;
  totalCount: number;
  offset: number;
  limit: number;
  records: TelemetryRecord[];
}

export class RewardHistoryDto {
  agentId: string;
  totalPoints: number;
  history: Array<{ timestamp: string; value: number }>;
  movingAverage: Array<{ timestamp: string; value: number }>;
  cumulativeReward: number;
  averageReward: number;
}

export class LearningMetricsDto {
  agentId: string;
  lossHistory: Array<{ timestamp: string; value: number }>;
  accuracyHistory: Array<{ timestamp: string; value: number }>;
  learningUpdates: number;
}
