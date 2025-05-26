import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for generating visualizations of agent performance and decision processes
 * Provides data transformation and visualization endpoints for analytics dashboards
 */
@Injectable()
export class VisualizationService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate reward history visualization data
   * @param params Visualization parameters
   * @returns Visualization data
   */
  async generateRewardVisualization(params: RewardVisualizationParamsDto): Promise<RewardVisualizationDto> {
    // Transform reward history data into visualization format
    const timeLabels = params.rewardHistory.map(item => item.timestamp);
    const rewardValues = params.rewardHistory.map(item => item.value);
    
    // Calculate cumulative rewards
    const cumulativeRewards = [];
    let cumulativeSum = 0;
    for (const value of rewardValues) {
      cumulativeSum += value;
      cumulativeRewards.push(cumulativeSum);
    }
    
    // Calculate moving average if window size is provided
    let movingAverageValues = [];
    if (params.movingAverageWindow && params.movingAverageWindow > 0) {
      movingAverageValues = this.calculateMovingAverage(rewardValues, params.movingAverageWindow);
    }
    
    // Generate visualization data
    return {
      title: params.title || 'Agent Reward History',
      description: params.description || 'Visualization of agent rewards over time',
      type: 'time-series',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Reward',
            data: rewardValues,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
          {
            label: 'Cumulative Reward',
            data: cumulativeRewards,
            borderColor: 'rgb(153, 102, 255)',
            tension: 0.1,
          },
          ...(movingAverageValues.length > 0 ? [
            {
              label: `Moving Average (Window: ${params.movingAverageWindow})`,
              data: movingAverageValues,
              borderColor: 'rgb(255, 159, 64)',
              tension: 0.1,
            }
          ] : []),
        ],
      },
      config: {
        scales: {
          x: {
            type: 'time',
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Reward Value',
            },
          },
        },
      },
    };
  }
  
  /**
   * Generate learning metrics visualization data
   * @param params Visualization parameters
   * @returns Visualization data
   */
  async generateLearningVisualization(params: LearningVisualizationParamsDto): Promise<LearningVisualizationDto> {
    // Transform learning metrics data into visualization format
    const timeLabels = params.lossHistory.map(item => item.timestamp);
    const lossValues = params.lossHistory.map(item => item.value);
    const accuracyValues = params.accuracyHistory.map(item => item.value);
    
    // Generate visualization data
    return {
      title: params.title || 'Agent Learning Progress',
      description: params.description || 'Visualization of agent learning metrics over time',
      type: 'time-series',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Loss',
            data: lossValues,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
            yAxisID: 'y',
          },
          {
            label: 'Accuracy',
            data: accuracyValues,
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1,
            yAxisID: 'y1',
          },
        ],
      },
      config: {
        scales: {
          x: {
            type: 'time',
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Loss',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Accuracy',
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    };
  }
  
  /**
   * Generate benchmark comparison visualization data
   * @param params Visualization parameters
   * @returns Visualization data
   */
  async generateBenchmarkVisualization(params: BenchmarkVisualizationParamsDto): Promise<BenchmarkVisualizationDto> {
    // Transform benchmark comparison data into visualization format
    const metricLabels = params.metricComparisons.map(metric => metric.name);
    
    // Create datasets for each agent
    const agentIds = new Set<string>();
    params.metricComparisons.forEach(metric => {
      metric.results.forEach(result => {
        agentIds.add(result.agentId);
      });
    });
    
    const datasets = Array.from(agentIds).map((agentId, index) => {
      const data = params.metricComparisons.map(metric => {
        const result = metric.results.find(r => r.agentId === agentId);
        return result ? result.value : null;
      });
      
      // Generate a color based on index
      const hue = (index * 137) % 360; // Golden angle approximation for good distribution
      const color = `hsl(${hue}, 70%, 60%)`;
      
      return {
        label: `Agent ${agentId}`,
        data,
        backgroundColor: color,
        borderColor: color,
      };
    });
    
    // Generate visualization data
    return {
      title: params.title || 'Benchmark Comparison',
      description: params.description || 'Comparison of agent performance across benchmark metrics',
      type: 'radar',
      data: {
        labels: metricLabels,
        datasets,
      },
      config: {
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    };
  }
  
  /**
   * Generate decision process visualization data
   * @param params Visualization parameters
   * @returns Visualization data
   */
  async generateDecisionVisualization(params: DecisionVisualizationParamsDto): Promise<DecisionVisualizationDto> {
    // Transform decision process data into visualization format
    const nodes = [];
    const edges = [];
    
    // Add observation node
    nodes.push({
      id: 'observation',
      label: 'Observation',
      type: 'input',
      data: {
        features: params.observationFeatures,
      },
    });
    
    // Add decision nodes
    params.decisionSteps.forEach((step, index) => {
      const nodeId = `decision_${index}`;
      
      nodes.push({
        id: nodeId,
        label: step.name,
        type: 'process',
        data: {
          description: step.description,
          metrics: step.metrics,
        },
      });
      
      // Add edge from previous node
      const sourceId = index === 0 ? 'observation' : `decision_${index - 1}`;
      edges.push({
        id: `edge_${sourceId}_${nodeId}`,
        source: sourceId,
        target: nodeId,
        label: step.transitionLabel || '',
      });
    });
    
    // Add action node
    nodes.push({
      id: 'action',
      label: 'Action',
      type: 'output',
      data: {
        actionType: params.actionType,
        parameters: params.actionParameters,
      },
    });
    
    // Add edge from last decision node to action
    const lastDecisionId = `decision_${params.decisionSteps.length - 1}`;
    edges.push({
      id: `edge_${lastDecisionId}_action`,
      source: lastDecisionId,
      target: 'action',
      label: 'Execute',
    });
    
    // Generate visualization data
    return {
      title: params.title || 'Agent Decision Process',
      description: params.description || 'Visualization of agent decision-making process',
      type: 'graph',
      data: {
        nodes,
        edges,
      },
      config: {
        direction: 'LR', // Left to right layout
        nodeWidth: 150,
        nodeHeight: 100,
        edgeStyle: 'bezier',
      },
    };
  }
  
  /**
   * Generate anomaly detection visualization data
   * @param params Visualization parameters
   * @returns Visualization data
   */
  async generateAnomalyVisualization(params: AnomalyVisualizationParamsDto): Promise<AnomalyVisualizationDto> {
    // Transform telemetry data into visualization format
    const timeLabels = params.telemetryData.map(item => item.timestamp);
    const metricValues = params.telemetryData.map(item => item.value);
    
    // Identify anomalies
    const anomalyIndices = this.detectAnomalies(metricValues, params.sensitivityThreshold || 2.0);
    const anomalyPoints = anomalyIndices.map(index => ({
      x: timeLabels[index],
      y: metricValues[index],
    }));
    
    // Generate visualization data
    return {
      title: params.title || 'Anomaly Detection',
      description: params.description || 'Visualization of detected anomalies in agent behavior',
      type: 'time-series',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: params.metricName || 'Metric',
            data: metricValues,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
          {
            label: 'Anomalies',
            data: anomalyPoints,
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            pointStyle: 'circle',
            pointRadius: 6,
            showLine: false,
          },
        ],
      },
      config: {
        scales: {
          x: {
            type: 'time',
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            title: {
              display: true,
              text: params.metricName || 'Metric Value',
            },
          },
        },
      },
      anomalies: anomalyIndices.map(index => ({
        timestamp: timeLabels[index],
        value: metricValues[index],
        deviation: this.calculateDeviation(metricValues, index),
      })),
    };
  }
  
  /**
   * Calculate moving average
   * @param values Array of values
   * @param windowSize Window size
   * @returns Moving average values
   */
  private calculateMovingAverage(values: number[], windowSize: number): number[] {
    if (values.length < windowSize) {
      return [];
    }
    
    const result = [];
    
    for (let i = windowSize - 1; i < values.length; i++) {
      const windowValues = values.slice(i - windowSize + 1, i + 1);
      const average = windowValues.reduce((sum, value) => sum + value, 0) / windowSize;
      result.push(average);
    }
    
    // Pad the beginning with nulls to match the original array length
    const padding = Array(windowSize - 1).fill(null);
    return [...padding, ...result];
  }
  
  /**
   * Detect anomalies using Z-score method
   * @param values Array of values
   * @param threshold Z-score threshold
   * @returns Indices of anomalies
   */
  private detectAnomalies(values: number[], threshold: number): number[] {
    // Calculate mean and standard deviation
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Detect anomalies using Z-score
    const anomalies = [];
    for (let i = 0; i < values.length; i++) {
      const zScore = Math.abs((values[i] - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push(i);
      }
    }
    
    return anomalies;
  }
  
  /**
   * Calculate deviation from mean
   * @param values Array of values
   * @param index Index of value
   * @returns Deviation as percentage
   */
  private calculateDeviation(values: number[], index: number): number {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const value = values[index];
    return ((value - mean) / Math.abs(mean)) * 100;
  }
}

// DTOs
export class RewardVisualizationParamsDto {
  rewardHistory: Array<{ timestamp: string; value: number }>;
  movingAverageWindow?: number;
  title?: string;
  description?: string;
}

export class RewardVisualizationDto {
  title: string;
  description: string;
  type: 'time-series';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }>;
  };
  config: any;
}

export class LearningVisualizationParamsDto {
  lossHistory: Array<{ timestamp: string; value: number }>;
  accuracyHistory: Array<{ timestamp: string; value: number }>;
  title?: string;
  description?: string;
}

export class LearningVisualizationDto {
  title: string;
  description: string;
  type: 'time-series';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
      yAxisID: string;
    }>;
  };
  config: any;
}

export class BenchmarkVisualizationParamsDto {
  metricComparisons: Array<{
    name: string;
    results: Array<{
      agentId: string;
      value: number;
    }>;
  }>;
  title?: string;
  description?: string;
}

export class BenchmarkVisualizationDto {
  title: string;
  description: string;
  type: 'radar';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }>;
  };
  config: any;
}

export class DecisionVisualizationParamsDto {
  observationFeatures: string[];
  decisionSteps: Array<{
    name: string;
    description: string;
    metrics: any;
    transitionLabel?: string;
  }>;
  actionType: string;
  actionParameters: any;
  title?: string;
  description?: string;
}

export class DecisionVisualizationDto {
  title: string;
  description: string;
  type: 'graph';
  data: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      data: any;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label: string;
    }>;
  };
  config: any;
}

export class AnomalyVisualizationParamsDto {
  telemetryData: Array<{ timestamp: string; value: number }>;
  metricName?: string;
  sensitivityThreshold?: number;
  title?: string;
  description?: string;
}

export class AnomalyVisualizationDto {
  title: string;
  description: string;
  type: 'time-series';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: any;
      borderColor: string;
      backgroundColor?: string;
      tension?: number;
      pointStyle?: string;
      pointRadius?: number;
      showLine?: boolean;
    }>;
  };
  config: any;
  anomalies: Array<{
    timestamp: string;
    value: number;
    deviation: number;
  }>;
}
