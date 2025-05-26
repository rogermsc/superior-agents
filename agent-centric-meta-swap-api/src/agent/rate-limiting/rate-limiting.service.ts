import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for dynamic rate limiting based on agent learning patterns
 * Provides adaptive rate limits that scale with agent learning progress
 */
@Injectable()
export class RateLimitingService {
  // In-memory store for rate limiting data
  // In a production environment, this would use Redis or another distributed cache
  private rateLimitStore: Map<string, AgentRateLimitData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Check if an agent has exceeded their rate limit
   * @param agentId The agent's unique identifier
   * @param endpoint The API endpoint being accessed
   * @returns Whether the request should be allowed
   */
  async checkRateLimit(agentId: string, endpoint: string): Promise<RateLimitCheckResult> {
    // Get agent's rate limit data, or create if not exists
    const rateLimitData = this.getOrCreateRateLimitData(agentId);
    
    // Get the current timestamp
    const now = Date.now();
    
    // Get endpoint-specific data, or create if not exists
    if (!rateLimitData.endpoints[endpoint]) {
      rateLimitData.endpoints[endpoint] = {
        requestCount: 0,
        lastRequestTime: now,
        windowStartTime: now,
      };
    }
    
    const endpointData = rateLimitData.endpoints[endpoint];
    
    // Check if we need to reset the window
    const windowDuration = this.getWindowDuration(rateLimitData.learningPhase);
    if (now - endpointData.windowStartTime > windowDuration) {
      endpointData.requestCount = 0;
      endpointData.windowStartTime = now;
    }
    
    // Check if the rate limit is exceeded
    const maxRequests = this.getMaxRequests(endpoint, rateLimitData.learningPhase);
    const isAllowed = endpointData.requestCount < maxRequests;
    
    // Update rate limit data if allowed
    if (isAllowed) {
      endpointData.requestCount++;
      endpointData.lastRequestTime = now;
      
      // Update agent's total request count
      rateLimitData.totalRequests++;
      
      // Check if we need to update the learning phase
      this.updateLearningPhaseIfNeeded(agentId, rateLimitData);
    }
    
    // Calculate remaining requests and reset time
    const remainingRequests = Math.max(0, maxRequests - endpointData.requestCount);
    const resetTime = endpointData.windowStartTime + windowDuration;
    
    return {
      isAllowed,
      remainingRequests,
      resetTime,
      currentPhase: rateLimitData.learningPhase,
      limitAdjustment: rateLimitData.limitAdjustment,
    };
  }
  
  /**
   * Get or create rate limit data for an agent
   * @param agentId The agent's unique identifier
   * @returns The agent's rate limit data
   */
  private getOrCreateRateLimitData(agentId: string): AgentRateLimitData {
    if (!this.rateLimitStore.has(agentId)) {
      this.rateLimitStore.set(agentId, {
        learningPhase: 'exploration',
        limitAdjustment: 1.0,
        totalRequests: 0,
        successfulRequests: 0,
        endpoints: {},
        lastPhaseUpdateTime: Date.now(),
      });
    }
    
    return this.rateLimitStore.get(agentId);
  }
  
  /**
   * Get the window duration based on learning phase
   * @param learningPhase The agent's current learning phase
   * @returns Window duration in milliseconds
   */
  private getWindowDuration(learningPhase: LearningPhase): number {
    // Different window durations for different learning phases
    const windowDurations = {
      'exploration': 60 * 1000, // 1 minute
      'exploitation': 5 * 60 * 1000, // 5 minutes
      'fine-tuning': 15 * 60 * 1000, // 15 minutes
    };
    
    return windowDurations[learningPhase];
  }
  
  /**
   * Get the maximum number of requests allowed for an endpoint
   * @param endpoint The API endpoint
   * @param learningPhase The agent's current learning phase
   * @returns Maximum number of requests allowed
   */
  private getMaxRequests(endpoint: string, learningPhase: LearningPhase): number {
    // Base limits for different endpoints
    let baseLimit = 100; // Default
    
    if (endpoint.includes('observation')) {
      baseLimit = 200;
    } else if (endpoint.includes('action')) {
      baseLimit = 50;
    } else if (endpoint.includes('reward')) {
      baseLimit = 100;
    }
    
    // Phase-specific multipliers
    const phaseMultipliers = {
      'exploration': 1.5, // Higher limits during exploration
      'exploitation': 1.0, // Standard limits during exploitation
      'fine-tuning': 0.7, // Lower limits during fine-tuning
    };
    
    return Math.floor(baseLimit * phaseMultipliers[learningPhase]);
  }
  
  /**
   * Update an agent's learning phase if needed
   * @param agentId The agent's unique identifier
   * @param rateLimitData The agent's rate limit data
   */
  private updateLearningPhaseIfNeeded(agentId: string, rateLimitData: AgentRateLimitData): void {
    const now = Date.now();
    const timeSinceLastUpdate = now - rateLimitData.lastPhaseUpdateTime;
    
    // Only check for phase updates periodically
    if (timeSinceLastUpdate < 24 * 60 * 60 * 1000) { // 24 hours
      return;
    }
    
    // Update based on total requests
    if (rateLimitData.learningPhase === 'exploration' && rateLimitData.totalRequests > 1000) {
      rateLimitData.learningPhase = 'exploitation';
      rateLimitData.lastPhaseUpdateTime = now;
    } else if (rateLimitData.learningPhase === 'exploitation' && rateLimitData.totalRequests > 5000) {
      rateLimitData.learningPhase = 'fine-tuning';
      rateLimitData.lastPhaseUpdateTime = now;
    }
    
    // In a real implementation, we would use more sophisticated metrics
    // such as reward trends, success rates, etc.
  }
  
  /**
   * Record a successful request for an agent
   * @param agentId The agent's unique identifier
   */
  async recordSuccessfulRequest(agentId: string): Promise<void> {
    const rateLimitData = this.getOrCreateRateLimitData(agentId);
    rateLimitData.successfulRequests++;
    
    // Adjust rate limits based on success rate
    const successRate = rateLimitData.successfulRequests / rateLimitData.totalRequests;
    if (successRate > 0.95) {
      // High success rate, increase limits
      rateLimitData.limitAdjustment = Math.min(2.0, rateLimitData.limitAdjustment + 0.1);
    } else if (successRate < 0.7) {
      // Low success rate, decrease limits
      rateLimitData.limitAdjustment = Math.max(0.5, rateLimitData.limitAdjustment - 0.1);
    }
  }
}

// Types
export type LearningPhase = 'exploration' | 'exploitation' | 'fine-tuning';

export interface EndpointRateLimitData {
  requestCount: number;
  lastRequestTime: number;
  windowStartTime: number;
}

export interface AgentRateLimitData {
  learningPhase: LearningPhase;
  limitAdjustment: number;
  totalRequests: number;
  successfulRequests: number;
  endpoints: {
    [endpoint: string]: EndpointRateLimitData;
  };
  lastPhaseUpdateTime: number;
}

export interface RateLimitCheckResult {
  isAllowed: boolean;
  remainingRequests: number;
  resetTime: number;
  currentPhase: LearningPhase;
  limitAdjustment: number;
}
