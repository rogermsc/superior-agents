import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for tracking and analyzing agent learning progress
 * Provides insights into learning efficiency and effectiveness
 */
@Injectable()
export class LearningProgressService {
  // In-memory store for learning progress data
  // In a production environment, this would use a database
  private learningProgressStore: Map<string, AgentLearningProgressData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Record learning progress snapshot
   * @param params Learning progress snapshot parameters
   * @returns Recorded snapshot information
   */
  async recordLearningSnapshot(params: LearningSnapshotDto): Promise<LearningSnapshotInfoDto> {
    // Get or create agent learning progress data
    const progressData = this.getOrCreateLearningProgressData(params.agentId);
    
    // Create snapshot ID
    const snapshotId = this.generateSnapshotId();
    
    // Create snapshot
    const snapshot: LearningSnapshot = {
      snapshotId,
      timestamp: new Date().toISOString(),
      episodeNumber: params.episodeNumber,
      metrics: {
        rewardMean: params.rewardMean,
        rewardStd: params.rewardStd,
        lossValue: params.lossValue,
        accuracyValue: params.accuracyValue,
        explorationRate: params.explorationRate,
        learningRate: params.learningRate,
        ...params.customMetrics,
      },
      modelState: params.modelState,
    };
    
    // Add snapshot to progress data
    progressData.snapshots.push(snapshot);
    
    // Update learning curve data
    this.updateLearningCurve(progressData, snapshot);
    
    // Return snapshot information
    return {
      snapshotId,
      agentId: params.agentId,
      timestamp: snapshot.timestamp,
      episodeNumber: snapshot.episodeNumber,
    };
  }
  
  /**
   * Get agent learning curve
   * @param agentId The agent's unique identifier
   * @returns Agent learning curve
   */
  async getAgentLearningCurve(agentId: string): Promise<LearningCurveDto> {
    // Get agent learning progress data
    const progressData = this.getLearningProgressData(agentId);
    
    // Return learning curve
    return {
      agentId,
      episodes: progressData.learningCurve.episodes,
      rewards: progressData.learningCurve.rewards,
      losses: progressData.learningCurve.losses,
      accuracies: progressData.learningCurve.accuracies,
      explorationRates: progressData.learningCurve.explorationRates,
      learningRates: progressData.learningCurve.learningRates,
    };
  }
  
  /**
   * Get agent learning progress summary
   * @param agentId The agent's unique identifier
   * @returns Agent learning progress summary
   */
  async getAgentLearningProgressSummary(agentId: string): Promise<LearningProgressSummaryDto> {
    // Get agent learning progress data
    const progressData = this.getLearningProgressData(agentId);
    
    // Calculate learning progress metrics
    const initialSnapshots = progressData.snapshots.slice(0, 5);
    const recentSnapshots = progressData.snapshots.slice(-5);
    
    // Calculate initial and recent averages
    const initialRewardMean = this.calculateAverageMetric(initialSnapshots, 'rewardMean');
    const recentRewardMean = this.calculateAverageMetric(recentSnapshots, 'rewardMean');
    
    const initialLoss = this.calculateAverageMetric(initialSnapshots, 'lossValue');
    const recentLoss = this.calculateAverageMetric(recentSnapshots, 'lossValue');
    
    const initialAccuracy = this.calculateAverageMetric(initialSnapshots, 'accuracyValue');
    const recentAccuracy = this.calculateAverageMetric(recentSnapshots, 'accuracyValue');
    
    // Calculate improvement percentages
    const rewardImprovement = initialRewardMean !== null && recentRewardMean !== null
      ? ((recentRewardMean - initialRewardMean) / Math.abs(initialRewardMean)) * 100
      : null;
    
    const lossImprovement = initialLoss !== null && recentLoss !== null
      ? ((initialLoss - recentLoss) / initialLoss) * 100
      : null;
    
    const accuracyImprovement = initialAccuracy !== null && recentAccuracy !== null
      ? ((recentAccuracy - initialAccuracy) / (1 - initialAccuracy)) * 100
      : null;
    
    // Calculate learning stability
    const rewardStability = this.calculateStability(progressData.learningCurve.rewards);
    const lossStability = this.calculateStability(progressData.learningCurve.losses);
    
    // Calculate learning efficiency
    const learningEfficiency = this.calculateLearningEfficiency(progressData);
    
    // Return learning progress summary
    return {
      agentId,
      snapshotCount: progressData.snapshots.length,
      latestEpisode: progressData.snapshots.length > 0
        ? progressData.snapshots[progressData.snapshots.length - 1].episodeNumber
        : 0,
      metrics: {
        currentReward: recentRewardMean,
        rewardImprovement,
        currentLoss: recentLoss,
        lossImprovement,
        currentAccuracy: recentAccuracy,
        accuracyImprovement,
        rewardStability,
        lossStability,
        learningEfficiency,
      },
      convergenceStatus: this.determineConvergenceStatus(progressData),
      recommendations: this.generateRecommendations(progressData),
    };
  }
  
  /**
   * Compare learning progress between agents
   * @param params Comparison parameters
   * @returns Learning progress comparison
   */
  async compareLearningProgress(params: CompareLearningProgressDto): Promise<LearningProgressComparisonDto> {
    // Get learning progress data for each agent
    const agentData = params.agentIds.map(agentId => {
      try {
        const progressData = this.getLearningProgressData(agentId);
        return {
          agentId,
          snapshots: progressData.snapshots,
          learningCurve: progressData.learningCurve,
        };
      } catch (error) {
        return null;
      }
    }).filter(data => data !== null);
    
    // Calculate comparison metrics
    const comparisonMetrics = {
      rewardImprovement: {},
      learningSpeed: {},
      finalPerformance: {},
      stability: {},
    };
    
    // Calculate metrics for each agent
    agentData.forEach(data => {
      // Calculate reward improvement
      const initialSnapshots = data.snapshots.slice(0, 5);
      const recentSnapshots = data.snapshots.slice(-5);
      
      const initialRewardMean = this.calculateAverageMetric(initialSnapshots, 'rewardMean');
      const recentRewardMean = this.calculateAverageMetric(recentSnapshots, 'rewardMean');
      
      const rewardImprovement = initialRewardMean !== null && recentRewardMean !== null
        ? ((recentRewardMean - initialRewardMean) / Math.abs(initialRewardMean)) * 100
        : null;
      
      // Calculate learning speed (episodes to reach 80% of final performance)
      const finalReward = data.learningCurve.rewards[data.learningCurve.rewards.length - 1];
      const targetReward = initialRewardMean + (finalReward - initialRewardMean) * 0.8;
      
      let learningSpeed = null;
      for (let i = 0; i < data.learningCurve.rewards.length; i++) {
        if (data.learningCurve.rewards[i] >= targetReward) {
          learningSpeed = data.learningCurve.episodes[i];
          break;
        }
      }
      
      // Calculate final performance
      const finalPerformance = recentRewardMean;
      
      // Calculate stability
      const stability = this.calculateStability(data.learningCurve.rewards);
      
      // Store metrics
      comparisonMetrics.rewardImprovement[data.agentId] = rewardImprovement;
      comparisonMetrics.learningSpeed[data.agentId] = learningSpeed;
      comparisonMetrics.finalPerformance[data.agentId] = finalPerformance;
      comparisonMetrics.stability[data.agentId] = stability;
    });
    
    // Determine rankings
    const rankings = {
      rewardImprovement: this.rankAgents(comparisonMetrics.rewardImprovement, true),
      learningSpeed: this.rankAgents(comparisonMetrics.learningSpeed, false),
      finalPerformance: this.rankAgents(comparisonMetrics.finalPerformance, true),
      stability: this.rankAgents(comparisonMetrics.stability, true),
    };
    
    // Return comparison
    return {
      agentIds: params.agentIds,
      metrics: comparisonMetrics,
      rankings,
    };
  }
  
  /**
   * Get or create agent learning progress data
   * @param agentId The agent's unique identifier
   * @returns Agent learning progress data
   */
  private getOrCreateLearningProgressData(agentId: string): AgentLearningProgressData {
    if (!this.learningProgressStore.has(agentId)) {
      this.learningProgressStore.set(agentId, {
        snapshots: [],
        learningCurve: {
          episodes: [],
          rewards: [],
          losses: [],
          accuracies: [],
          explorationRates: [],
          learningRates: [],
        },
      });
    }
    
    return this.learningProgressStore.get(agentId);
  }
  
  /**
   * Get agent learning progress data
   * @param agentId The agent's unique identifier
   * @returns Agent learning progress data
   * @throws Error if agent not found
   */
  private getLearningProgressData(agentId: string): AgentLearningProgressData {
    const progressData = this.learningProgressStore.get(agentId);
    if (!progressData) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return progressData;
  }
  
  /**
   * Update learning curve data
   * @param progressData Agent learning progress data
   * @param snapshot Learning snapshot
   */
  private updateLearningCurve(progressData: AgentLearningProgressData, snapshot: LearningSnapshot): void {
    progressData.learningCurve.episodes.push(snapshot.episodeNumber);
    progressData.learningCurve.rewards.push(snapshot.metrics.rewardMean);
    progressData.learningCurve.losses.push(snapshot.metrics.lossValue);
    progressData.learningCurve.accuracies.push(snapshot.metrics.accuracyValue);
    progressData.learningCurve.explorationRates.push(snapshot.metrics.explorationRate);
    progressData.learningCurve.learningRates.push(snapshot.metrics.learningRate);
  }
  
  /**
   * Calculate average metric from snapshots
   * @param snapshots Array of learning snapshots
   * @param metricName Metric name
   * @returns Average metric value
   */
  private calculateAverageMetric(snapshots: LearningSnapshot[], metricName: string): number {
    if (snapshots.length === 0) {
      return null;
    }
    
    const validValues = snapshots
      .map(snapshot => snapshot.metrics[metricName])
      .filter(value => value !== undefined && value !== null);
    
    if (validValues.length === 0) {
      return null;
    }
    
    return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
  }
  
  /**
   * Calculate stability of a metric
   * @param values Array of metric values
   * @returns Stability score (0-1)
   */
  private calculateStability(values: number[]): number {
    if (values.length < 2) {
      return null;
    }
    
    // Calculate moving average
    const windowSize = Math.min(5, Math.floor(values.length / 2));
    const movingAvg = [];
    
    for (let i = windowSize - 1; i < values.length; i++) {
      const windowValues = values.slice(i - windowSize + 1, i + 1);
      const average = windowValues.reduce((sum, value) => sum + value, 0) / windowSize;
      movingAvg.push(average);
    }
    
    // Calculate variance of differences between actual values and moving average
    const differences = [];
    for (let i = 0; i < movingAvg.length; i++) {
      differences.push(Math.abs(values[i + windowSize - 1] - movingAvg[i]));
    }
    
    const meanDiff = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    const meanValue = values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length;
    
    // Normalize stability score (0-1)
    const stabilityScore = Math.max(0, 1 - (meanDiff / meanValue));
    
    return stabilityScore;
  }
  
  /**
   * Calculate learning efficiency
   * @param progressData Agent learning progress data
   * @returns Learning efficiency score (0-1)
   */
  private calculateLearningEfficiency(progressData: AgentLearningProgressData): number {
    if (progressData.snapshots.length < 10) {
      return null;
    }
    
    // Calculate area under the learning curve
    const rewards = progressData.learningCurve.rewards;
    const episodes = progressData.learningCurve.episodes;
    
    let areaUnderCurve = 0;
    for (let i = 1; i < rewards.length; i++) {
      const width = episodes[i] - episodes[i - 1];
      const height = (rewards[i] + rewards[i - 1]) / 2;
      areaUnderCurve += width * height;
    }
    
    // Calculate ideal area (immediate learning)
    const idealArea = episodes[episodes.length - 1] * rewards[rewards.length - 1];
    
    // Calculate efficiency
    const efficiency = areaUnderCurve / idealArea;
    
    return efficiency;
  }
  
  /**
   * Determine convergence status
   * @param progressData Agent learning progress data
   * @returns Convergence status
   */
  private determineConvergenceStatus(progressData: AgentLearningProgressData): string {
    if (progressData.snapshots.length < 10) {
      return 'insufficient_data';
    }
    
    // Check if rewards have plateaued
    const recentRewards = progressData.learningCurve.rewards.slice(-10);
    const rewardMean = recentRewards.reduce((sum, reward) => sum + reward, 0) / recentRewards.length;
    const rewardVariance = recentRewards.reduce((sum, reward) => sum + Math.pow(reward - rewardMean, 2), 0) / recentRewards.length;
    const rewardStd = Math.sqrt(rewardVariance);
    
    // Check if loss has plateaued
    const recentLosses = progressData.learningCurve.losses.slice(-10);
    const lossMean = recentLosses.reduce((sum, loss) => sum + loss, 0) / recentLosses.length;
    const lossVariance = recentLosses.reduce((sum, loss) => sum + Math.pow(loss - lossMean, 2), 0) / recentLosses.length;
    const lossStd = Math.sqrt(lossVariance);
    
    // Determine convergence status
    if (rewardStd / Math.abs(rewardMean) < 0.05 && lossStd / lossMean < 0.05) {
      return 'converged';
    } else if (rewardStd / Math.abs(rewardMean) < 0.1 && lossStd / lossMean < 0.1) {
      return 'near_convergence';
    } else {
      return 'learning';
    }
  }
  
  /**
   * Generate recommendations based on learning progress
   * @param progressData Agent learning progress data
   * @returns Recommendations
   */
  private generateRecommendations(progressData: AgentLearningProgressData): string[] {
    if (progressData.snapshots.length < 10) {
      return ['Collect more training data to enable meaningful analysis'];
    }
    
    const recommendations = [];
    
    // Check for plateaued learning
    const recentLosses = progressData.learningCurve.losses.slice(-10);
    const lossMean = recentLosses.reduce((sum, loss) => sum + loss, 0) / recentLosses.length;
    const lossVariance = recentLosses.reduce((sum, loss) => sum + Math.pow(loss - lossMean, 2), 0) / recentLosses.length;
    const lossStd = Math.sqrt(lossVariance);
    
    if (lossStd / lossMean < 0.05) {
      // Learning has plateaued
      const recentRewards = progressData.learningCurve.rewards.slice(-10);
      const rewardMean = recentRewards.reduce((sum, reward) => sum + reward, 0) / recentRewards.length;
      
      if (rewardMean < 0.7) {
        // Suboptimal performance
        recommendations.push('Consider adjusting model architecture for better performance');
        recommendations.push('Experiment with different reward function formulations');
      } else {
        // Good performance
        recommendations.push('Agent has converged with good performance');
        recommendations.push('Consider reducing model complexity for efficiency');
      }
    } else {
      // Still learning
      const recentExplorationRates = progressData.learningCurve.explorationRates.slice(-10);
      const explorationMean = recentExplorationRates.reduce((sum, rate) => sum + rate, 0) / recentExplorationRates.length;
      
      if (explorationMean < 0.1) {
        recommendations.push('Consider increasing exploration rate to avoid local optima');
      }
      
      const recentLearningRates = progressData.learningCurve.learningRates.slice(-10);
      const learningRateMean = recentLearningRates.reduce((sum, rate) => sum + rate, 0) / recentLearningRates.length;
      
      if (learningRateMean < 0.001) {
        recommendations.push('Consider increasing learning rate to speed up convergence');
      } else if (learningRateMean > 0.1) {
        recommendations.push('Consider decreasing learning rate for more stable learning');
      }
    }
    
    return recommendations;
  }
  
  /**
   * Rank agents based on metric values
   * @param metricValues Object mapping agent IDs to metric values
   * @param higherIsBetter Whether higher values are better
   * @returns Object mapping agent IDs to ranks
   */
  private rankAgents(metricValues: { [agentId: string]: number }, higherIsBetter: boolean): { [agentId: string]: number } {
    // Convert to array of [agentId, value] pairs
    const entries = Object.entries(metricValues);
    
    // Sort by value
    entries.sort((a, b) => {
      if (a[1] === null) return 1;
      if (b[1] === null) return -1;
      return higherIsBetter ? b[1] - a[1] : a[1] - b[1];
    });
    
    // Assign ranks
    const ranks = {};
    entries.forEach(([agentId, value], index) => {
      ranks[agentId] = index + 1;
    });
    
    return ranks;
  }
  
  /**
   * Generate a unique snapshot ID
   * @returns Unique snapshot ID
   */
  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
interface AgentLearningProgressData {
  snapshots: LearningSnapshot[];
  learningCurve: {
    episodes: number[];
    rewards: number[];
    losses: number[];
    accuracies: number[];
    explorationRates: number[];
    learningRates: number[];
  };
}

interface LearningSnapshot {
  snapshotId: string;
  timestamp: string;
  episodeNumber: number;
  metrics: {
    rewardMean: number;
    rewardStd: number;
    lossValue: number;
    accuracyValue: number;
    explorationRate: number;
    learningRate: number;
    [key: string]: any;
  };
  modelState: any;
}

// DTOs
export class LearningSnapshotDto {
  agentId: string;
  episodeNumber: number;
  rewardMean: number;
  rewardStd: number;
  lossValue: number;
  accuracyValue: number;
  explorationRate: number;
  learningRate: number;
  customMetrics?: any;
  modelState: any;
}

export class LearningSnapshotInfoDto {
  snapshotId: string;
  agentId: string;
  timestamp: string;
  episodeNumber: number;
}

export class LearningCurveDto {
  agentId: string;
  episodes: number[];
  rewards: number[];
  losses: number[];
  accuracies: number[];
  explorationRates: number[];
  learningRates: number[];
}

export class LearningProgressSummaryDto {
  agentId: string;
  snapshotCount: number;
  latestEpisode: number;
  metrics: {
    currentReward: number;
    rewardImprovement: number;
    currentLoss: number;
    lossImprovement: number;
    currentAccuracy: number;
    accuracyImprovement: number;
    rewardStability: number;
    lossStability: number;
    learningEfficiency: number;
  };
  convergenceStatus: string;
  recommendations: string[];
}

export class CompareLearningProgressDto {
  agentIds: string[];
}

export class LearningProgressComparisonDto {
  agentIds: string[];
  metrics: {
    rewardImprovement: { [agentId: string]: number };
    learningSpeed: { [agentId: string]: number };
    finalPerformance: { [agentId: string]: number };
    stability: { [agentId: string]: number };
  };
  rankings: {
    rewardImprovement: { [agentId: string]: number };
    learningSpeed: { [agentId: string]: number };
    finalPerformance: { [agentId: string]: number };
    stability: { [agentId: string]: number };
  };
}
