import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for calculating and providing rewards to agents
 * Rewards are the feedback signals that guide agent learning
 */
@Injectable()
export class RewardService {
  constructor(private configService: ConfigService) {}

  /**
   * Calculate reward for a completed action
   * @param rewardParams Parameters for reward calculation
   * @returns Calculated reward data
   */
  async calculateActionReward(rewardParams: ActionRewardParamsDto): Promise<RewardResultDto> {
    // In a real implementation, this would calculate rewards based on action outcomes
    // For now, we'll return a structured mock response
    
    let baseReward = 0;
    let components = {};
    
    // Calculate base reward based on action type
    if (rewardParams.actionType === 'swap') {
      baseReward = this.calculateSwapReward(rewardParams);
      components = {
        priceImprovement: this.calculatePriceImprovementReward(rewardParams),
        slippageAvoidance: this.calculateSlippageAvoidanceReward(rewardParams),
        gasSaving: this.calculateGasSavingReward(rewardParams),
        timing: this.calculateTimingReward(rewardParams),
      };
    } else if (rewardParams.actionType === 'transfer') {
      baseReward = this.calculateTransferReward(rewardParams);
      components = {
        efficiency: this.calculateEfficiencyReward(rewardParams),
        gasSaving: this.calculateGasSavingReward(rewardParams),
      };
    }
    
    // Calculate total reward
    const totalReward = baseReward + Object.values(components).reduce((sum, val) => sum + (val as number), 0);
    
    return {
      rewardId: this.generateRewardId(),
      timestamp: new Date().toISOString(),
      actionId: rewardParams.actionId,
      baseReward,
      components,
      totalReward,
      metadata: {
        difficulty: rewardParams.difficulty || 1,
        learningPhase: rewardParams.learningPhase || 'exploration',
        scalingFactor: this.getRewardScalingFactor(rewardParams),
      }
    };
  }
  
  /**
   * Calculate reward for a swap action
   * @param rewardParams Reward parameters
   * @returns Base reward value
   */
  private calculateSwapReward(rewardParams: ActionRewardParamsDto): number {
    // Mock implementation
    // In a real system, this would be based on the action outcome vs. expected outcome
    const successBonus = rewardParams.success ? 10 : -5;
    const amountFactor = Math.log(Number(rewardParams.amount) || 1) / 10;
    return successBonus * amountFactor;
  }
  
  /**
   * Calculate reward for a transfer action
   * @param rewardParams Reward parameters
   * @returns Base reward value
   */
  private calculateTransferReward(rewardParams: ActionRewardParamsDto): number {
    // Mock implementation
    const successBonus = rewardParams.success ? 5 : -3;
    return successBonus;
  }
  
  /**
   * Calculate reward component for price improvement
   * @param rewardParams Reward parameters
   * @returns Reward component value
   */
  private calculatePriceImprovementReward(rewardParams: ActionRewardParamsDto): number {
    // Mock implementation
    if (!rewardParams.executionDetails?.executionPrice || !rewardParams.executionDetails?.expectedPrice) {
      return 0;
    }
    
    const executionPrice = Number(rewardParams.executionDetails.executionPrice);
    const expectedPrice = Number(rewardParams.executionDetails.expectedPrice);
    
    // Calculate percentage improvement
    const improvement = (executionPrice - expectedPrice) / expectedPrice;
    
    // Scale to a reasonable reward value
    return improvement * 20;
  }
  
  /**
   * Calculate reward component for slippage avoidance
   * @param rewardParams Reward parameters
   * @returns Reward component value
   */
  private calculateSlippageAvoidanceReward(rewardParams: ActionRewardParamsDto): number {
    // Mock implementation
    if (!rewardParams.executionDetails?.slippage) {
      return 0;
    }
    
    const slippage = Number(rewardParams.executionDetails.slippage);
    
    // Lower slippage is better
    return Math.max(0, 5 - slippage * 10);
  }
  
  /**
   * Calculate reward component for gas savings
   * @param rewardParams Reward parameters
   * @returns Reward component value
   */
  private calculateGasSavingReward(rewardParams: ActionRewardParamsDto): number {
    // Mock implementation
    if (!rewardParams.executionDetails?.gasUsed || !rewardParams.executionDetails?.estimatedGas) {
      return 0;
    }
    
    const gasUsed = Number(rewardParams.executionDetails.gasUsed);
    const estimatedGas = Number(rewardParams.executionDetails.estimatedGas);
    
    // Calculate percentage savings
    const savings = (estimatedGas - gasUsed) / estimatedGas;
    
    // Scale to a reasonable reward value
    return savings * 10;
  }
  
  /**
   * Calculate reward component for timing
   * @param rewardParams Reward parameters
   * @returns Reward component value
   */
  private calculateTimingReward(rewardParams: ActionRewardParamsDto): number {
    // Mock implementation
    // In a real system, this would be based on market conditions at execution time
    return Math.random() * 5;
  }
  
  /**
   * Calculate reward component for efficiency
   * @param rewardParams Reward parameters
   * @returns Reward component value
   */
  private calculateEfficiencyReward(rewardParams: ActionRewardParamsDto): number {
    // Mock implementation
    if (!rewardParams.executionDetails?.processingTime) {
      return 0;
    }
    
    const processingTime = Number(rewardParams.executionDetails.processingTime);
    
    // Faster is better
    return Math.max(0, 5 - processingTime / 1000);
  }
  
  /**
   * Get reward scaling factor based on learning phase
   * @param rewardParams Reward parameters
   * @returns Scaling factor
   */
  private getRewardScalingFactor(rewardParams: ActionRewardParamsDto): number {
    // Different scaling factors for different learning phases
    const scalingFactors = {
      'exploration': 1.0,
      'exploitation': 0.8,
      'fine-tuning': 0.5,
    };
    
    return scalingFactors[rewardParams.learningPhase || 'exploration'] || 1.0;
  }
  
  /**
   * Generate a unique reward ID
   * @returns Unique reward ID
   */
  private generateRewardId(): string {
    return `reward_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// DTOs
export class ActionRewardParamsDto {
  actionId: string;
  actionType: 'swap' | 'transfer' | string;
  success: boolean;
  amount?: string;
  executionDetails?: {
    executionPrice?: string;
    expectedPrice?: string;
    slippage?: number;
    gasUsed?: string;
    estimatedGas?: string;
    processingTime?: number;
    [key: string]: any;
  };
  difficulty?: number;
  learningPhase?: 'exploration' | 'exploitation' | 'fine-tuning';
}

export class RewardResultDto {
  rewardId: string;
  timestamp: string;
  actionId: string;
  baseReward: number;
  components: {
    [key: string]: number | object;
  };
  totalReward: number;
  metadata: {
    difficulty: number;
    learningPhase: string;
    scalingFactor: number;
    [key: string]: any;
  };
}
