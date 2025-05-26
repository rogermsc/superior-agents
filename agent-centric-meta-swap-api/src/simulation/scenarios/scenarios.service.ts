import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for generating and managing predefined market scenarios
 * Provides controlled environments for targeted agent learning
 */
@Injectable()
export class ScenariosService {
  constructor(private configService: ConfigService) {}

  /**
   * Initialize scenario data source for a simulation
   * @param params Initialization parameters
   * @returns Scenario data source configuration
   */
  async initialize(params: ScenarioInitParamsDto): Promise<ScenarioDataSourceDto> {
    // Validate scenario type
    this.validateScenarioType(params.scenarioType);
    
    // Get scenario configuration
    const scenarioConfig = this.getScenarioConfig(params.scenarioType, params.parameters);
    
    // Create and return the data source configuration
    return {
      type: 'scenario',
      scenarioType: params.scenarioType,
      parameters: params.parameters || {},
      duration: scenarioConfig.duration,
      status: 'ready',
      metadata: {
        simulationId: params.simulationId,
        description: scenarioConfig.description,
        difficulty: scenarioConfig.difficulty,
      }
    };
  }
  
  /**
   * Get scenario data for a specific time point
   * @param params Query parameters
   * @returns Scenario market data
   */
  async getScenarioData(params: ScenarioDataQueryDto): Promise<ScenarioMarketDataDto> {
    // Get scenario configuration
    const scenarioConfig = this.getScenarioConfig(params.scenarioType, params.parameters);
    
    // Calculate progress through the scenario (0-1)
    const startTime = new Date(params.startTime).getTime();
    const currentTime = new Date(params.currentTime).getTime();
    const progress = Math.min(1, Math.max(0, (currentTime - startTime) / (scenarioConfig.duration * 1000)));
    
    // Generate market data based on scenario type and progress
    return this.generateMarketData(params.scenarioType, params.parameters, progress, params.tokens);
  }
  
  /**
   * Get available scenario types
   * @returns List of available scenarios
   */
  async getAvailableScenarios(): Promise<ScenarioListDto> {
    return {
      scenarios: [
        {
          type: 'bull_market',
          description: 'Sustained upward price movement with low volatility',
          parameters: ['intensity', 'duration'],
          difficulty: 'easy',
        },
        {
          type: 'bear_market',
          description: 'Sustained downward price movement with moderate volatility',
          parameters: ['intensity', 'duration'],
          difficulty: 'medium',
        },
        {
          type: 'market_crash',
          description: 'Sudden sharp decline in prices with high volatility',
          parameters: ['intensity', 'recovery_speed'],
          difficulty: 'hard',
        },
        {
          type: 'sideways_market',
          description: 'Range-bound price movement with low volatility',
          parameters: ['range_width', 'duration'],
          difficulty: 'medium',
        },
        {
          type: 'high_volatility',
          description: 'Erratic price movements with high volatility',
          parameters: ['intensity', 'direction_bias'],
          difficulty: 'hard',
        },
        {
          type: 'liquidity_crisis',
          description: 'Reduced market depth and wider spreads',
          parameters: ['intensity', 'duration'],
          difficulty: 'expert',
        },
        {
          type: 'flash_crash',
          description: 'Extremely rapid price decline followed by recovery',
          parameters: ['intensity', 'recovery_speed'],
          difficulty: 'expert',
        },
      ]
    };
  }
  
  /**
   * Validate scenario type
   * @param scenarioType Scenario type
   * @throws Error if scenario type is invalid
   */
  private validateScenarioType(scenarioType: string): void {
    const validScenarios = [
      'bull_market',
      'bear_market',
      'market_crash',
      'sideways_market',
      'high_volatility',
      'liquidity_crisis',
      'flash_crash',
    ];
    
    if (!validScenarios.includes(scenarioType)) {
      throw new Error(`Invalid scenario type: ${scenarioType}`);
    }
  }
  
  /**
   * Get configuration for a scenario
   * @param scenarioType Scenario type
   * @param parameters Scenario parameters
   * @returns Scenario configuration
   */
  private getScenarioConfig(scenarioType: string, parameters: any = {}): any {
    // Default configurations for different scenarios
    const configs = {
      'bull_market': {
        description: 'Sustained upward price movement with low volatility',
        duration: parameters.duration || 7 * 24 * 60 * 60, // 7 days in seconds
        intensity: parameters.intensity || 0.5,
        difficulty: 'easy',
      },
      'bear_market': {
        description: 'Sustained downward price movement with moderate volatility',
        duration: parameters.duration || 14 * 24 * 60 * 60, // 14 days in seconds
        intensity: parameters.intensity || 0.5,
        difficulty: 'medium',
      },
      'market_crash': {
        description: 'Sudden sharp decline in prices with high volatility',
        duration: 24 * 60 * 60, // 1 day in seconds
        intensity: parameters.intensity || 0.7,
        recovery_speed: parameters.recovery_speed || 0.3,
        difficulty: 'hard',
      },
      'sideways_market': {
        description: 'Range-bound price movement with low volatility',
        duration: parameters.duration || 30 * 24 * 60 * 60, // 30 days in seconds
        range_width: parameters.range_width || 0.1,
        difficulty: 'medium',
      },
      'high_volatility': {
        description: 'Erratic price movements with high volatility',
        duration: parameters.duration || 3 * 24 * 60 * 60, // 3 days in seconds
        intensity: parameters.intensity || 0.8,
        direction_bias: parameters.direction_bias || 0, // -1 to 1, negative for downward bias
        difficulty: 'hard',
      },
      'liquidity_crisis': {
        description: 'Reduced market depth and wider spreads',
        duration: parameters.duration || 2 * 24 * 60 * 60, // 2 days in seconds
        intensity: parameters.intensity || 0.6,
        difficulty: 'expert',
      },
      'flash_crash': {
        description: 'Extremely rapid price decline followed by recovery',
        duration: 4 * 60 * 60, // 4 hours in seconds
        intensity: parameters.intensity || 0.9,
        recovery_speed: parameters.recovery_speed || 0.5,
        difficulty: 'expert',
      },
    };
    
    return configs[scenarioType] || configs['bull_market'];
  }
  
  /**
   * Generate market data based on scenario type and progress
   * @param scenarioType Scenario type
   * @param parameters Scenario parameters
   * @param progress Progress through the scenario (0-1)
   * @param tokens List of tokens
   * @returns Market data
   */
  private generateMarketData(scenarioType: string, parameters: any = {}, progress: number, tokens: string[]): ScenarioMarketDataDto {
    // Get scenario configuration
    const config = this.getScenarioConfig(scenarioType, parameters);
    
    // Base market data
    const marketData: ScenarioMarketDataDto = {
      timestamp: new Date().toISOString(),
      progress,
      tokens: {},
      marketMetrics: {
        volatilityIndex: 0,
        liquidityIndex: 0,
        sentimentIndex: 0,
      }
    };
    
    // Set market metrics based on scenario type and progress
    switch (scenarioType) {
      case 'bull_market':
        marketData.marketMetrics.volatilityIndex = 20 + (10 * Math.sin(progress * Math.PI));
        marketData.marketMetrics.liquidityIndex = 80 + (10 * Math.sin(progress * Math.PI));
        marketData.marketMetrics.sentimentIndex = 70 + (20 * progress);
        break;
      case 'bear_market':
        marketData.marketMetrics.volatilityIndex = 40 + (20 * Math.sin(progress * Math.PI));
        marketData.marketMetrics.liquidityIndex = 60 - (20 * progress);
        marketData.marketMetrics.sentimentIndex = 30 - (20 * progress);
        break;
      case 'market_crash':
        // Crash happens in the first 20% of the scenario
        const crashPoint = Math.min(1, progress / 0.2);
        marketData.marketMetrics.volatilityIndex = 50 + (50 * Math.exp(-5 * (crashPoint - 0.5) * (crashPoint - 0.5)));
        marketData.marketMetrics.liquidityIndex = 80 - (60 * Math.exp(-5 * (crashPoint - 0.5) * (crashPoint - 0.5)));
        marketData.marketMetrics.sentimentIndex = 50 - (40 * Math.exp(-5 * (crashPoint - 0.5) * (crashPoint - 0.5)));
        break;
      case 'sideways_market':
        marketData.marketMetrics.volatilityIndex = 30 + (10 * Math.sin(progress * 10 * Math.PI));
        marketData.marketMetrics.liquidityIndex = 70 + (10 * Math.sin(progress * 5 * Math.PI));
        marketData.marketMetrics.sentimentIndex = 50 + (10 * Math.sin(progress * 8 * Math.PI));
        break;
      case 'high_volatility':
        marketData.marketMetrics.volatilityIndex = 70 + (30 * Math.sin(progress * 20 * Math.PI));
        marketData.marketMetrics.liquidityIndex = 50 + (20 * Math.sin(progress * 15 * Math.PI));
        marketData.marketMetrics.sentimentIndex = 40 + (30 * Math.sin(progress * 10 * Math.PI));
        break;
      case 'liquidity_crisis':
        marketData.marketMetrics.volatilityIndex = 60 + (20 * progress);
        marketData.marketMetrics.liquidityIndex = 70 - (60 * progress);
        marketData.marketMetrics.sentimentIndex = 40 - (30 * progress);
        break;
      case 'flash_crash':
        // Crash happens at 10% progress, recovery starts at 30% progress
        const flashCrashPhase = progress < 0.1 ? 0 : progress < 0.3 ? (progress - 0.1) / 0.2 : 1;
        const flashCrashRecovery = progress < 0.3 ? 0 : (progress - 0.3) / 0.7;
        marketData.marketMetrics.volatilityIndex = 30 + (70 * Math.exp(-10 * (flashCrashPhase - 0.5) * (flashCrashPhase - 0.5)));
        marketData.marketMetrics.liquidityIndex = 80 - (70 * flashCrashPhase) + (50 * flashCrashRecovery);
        marketData.marketMetrics.sentimentIndex = 60 - (50 * flashCrashPhase) + (30 * flashCrashRecovery);
        break;
      default:
        // Default to bull market
        marketData.marketMetrics.volatilityIndex = 20 + (10 * Math.sin(progress * Math.PI));
        marketData.marketMetrics.liquidityIndex = 80 + (10 * Math.sin(progress * Math.PI));
        marketData.marketMetrics.sentimentIndex = 70 + (20 * progress);
    }
    
    // Generate token data
    for (const token of tokens) {
      // Base price that's deterministic based on token
      const basePrice = this.getBasePriceForToken(token);
      
      // Price modifier based on scenario and progress
      const priceModifier = this.getPriceModifier(scenarioType, parameters, progress);
      
      // Final price
      const price = basePrice * priceModifier;
      
      // Volume modifier based on scenario and progress
      const volumeModifier = this.getVolumeModifier(scenarioType, parameters, progress);
      
      // Market depth modifier based on scenario and progress
      const depthModifier = this.getDepthModifier(scenarioType, parameters, progress);
      
      marketData.tokens[token] = {
        price,
        priceChange24h: this.getPriceChange(scenarioType, parameters, progress),
        volume: Math.floor(1000000 * volumeModifier),
        marketDepth: {
          asks: this.generateOrderBook('ask', price, 5, depthModifier),
          bids: this.generateOrderBook('bid', price, 5, depthModifier),
        }
      };
    }
    
    return marketData;
  }
  
  /**
   * Get base price for a token
   * @param token Token address
   * @returns Base price
   */
  private getBasePriceForToken(token: string): number {
    // Simple hash function for demonstration
    const hash = this.simpleHash(token);
    
    // Different price ranges for different tokens
    if (token.toLowerCase().includes('btc')) {
      return 30000 + (hash % 20000); // BTC: $30,000 - $50,000
    } else if (token.toLowerCase().includes('eth')) {
      return 1500 + (hash % 2000); // ETH: $1,500 - $3,500
    } else if (token.toLowerCase().includes('usdc') || token.toLowerCase().includes('usdt')) {
      return 0.98 + (hash % 5) / 100; // Stablecoins: $0.98 - $1.03
    } else {
      return 0.1 + (hash % 1000) / 10; // Other tokens: $0.1 - $100.1
    }
  }
  
  /**
   * Get price modifier based on scenario and progress
   * @param scenarioType Scenario type
   * @param parameters Scenario parameters
   * @param progress Progress through the scenario (0-1)
   * @returns Price modifier
   */
  private getPriceModifier(scenarioType: string, parameters: any = {}, progress: number): number {
    const intensity = parameters.intensity || 0.5;
    
    switch (scenarioType) {
      case 'bull_market':
        // Exponential growth
        return 1 + (intensity * progress);
      case 'bear_market':
        // Exponential decline
        return 1 - (intensity * 0.7 * progress);
      case 'market_crash':
        // Sharp decline followed by recovery
        const crashPoint = Math.min(1, progress / 0.2);
        const recoveryPoint = Math.max(0, (progress - 0.2) / 0.8);
        const recoverySpeed = parameters.recovery_speed || 0.3;
        
        const crashEffect = intensity * (1 - Math.exp(-5 * crashPoint));
        const recoveryEffect = recoverySpeed * recoveryPoint;
        
        return 1 - crashEffect + (crashEffect * recoveryEffect);
      case 'sideways_market':
        // Oscillation within a range
        const rangeWidth = parameters.range_width || 0.1;
        return 1 + (rangeWidth * Math.sin(progress * 10 * Math.PI));
      case 'high_volatility':
        // Erratic movement with possible direction bias
        const directionBias = parameters.direction_bias || 0;
        return 1 + (intensity * 0.5 * Math.sin(progress * 20 * Math.PI)) + (directionBias * progress);
      case 'liquidity_crisis':
        // Gradual decline with high volatility
        return 1 - (intensity * 0.3 * progress) + (intensity * 0.2 * Math.sin(progress * 15 * Math.PI));
      case 'flash_crash':
        // Sudden sharp decline followed by recovery
        const flashCrashPhase = progress < 0.1 ? 0 : progress < 0.3 ? (progress - 0.1) / 0.2 : 1;
        const flashCrashRecovery = progress < 0.3 ? 0 : (progress - 0.3) / 0.7;
        const crashDepth = intensity * 0.7;
        
        return 1 - (crashDepth * flashCrashPhase) + (crashDepth * parameters.recovery_speed * flashCrashRecovery);
      default:
        return 1;
    }
  }
  
  /**
   * Get volume modifier based on scenario and progress
   * @param scenarioType Scenario type
   * @param parameters Scenario parameters
   * @param progress Progress through the scenario (0-1)
   * @returns Volume modifier
   */
  private getVolumeModifier(scenarioType: string, parameters: any = {}, progress: number): number {
    const intensity = parameters.intensity || 0.5;
    
    switch (scenarioType) {
      case 'bull_market':
        // Volume increases with price
        return 1 + (intensity * progress);
      case 'bear_market':
        // Volume increases initially, then decreases
        return 1 + (intensity * progress * (1 - progress));
      case 'market_crash':
        // Volume spikes during crash
        const crashPoint = Math.min(1, progress / 0.2);
        return 1 + (intensity * 3 * Math.exp(-10 * (crashPoint - 0.5) * (crashPoint - 0.5)));
      case 'sideways_market':
        // Low volume with occasional spikes
        return 0.7 + (0.5 * Math.pow(Math.sin(progress * 10 * Math.PI), 2));
      case 'high_volatility':
        // High volume with erratic changes
        return 1.5 + (intensity * Math.sin(progress * 20 * Math.PI));
      case 'liquidity_crisis':
        // Volume decreases over time
        return 1 - (intensity * 0.7 * progress);
      case 'flash_crash':
        // Volume spikes during crash and recovery
        const flashCrashPhase = progress < 0.1 ? 0 : progress < 0.3 ? (progress - 0.1) / 0.2 : 1;
        const flashCrashRecovery = progress < 0.3 ? 0 : (progress - 0.3) / 0.7;
        
        return 1 + (intensity * 4 * Math.exp(-10 * (flashCrashPhase - 0.5) * (flashCrashPhase - 0.5)))
                + (intensity * 2 * Math.exp(-10 * (flashCrashRecovery - 0.3) * (flashCrashRecovery - 0.3)));
      default:
        return 1;
    }
  }
  
  /**
   * Get market depth modifier based on scenario and progress
   * @param scenarioType Scenario type
   * @param parameters Scenario parameters
   * @param progress Progress through the scenario (0-1)
   * @returns Depth modifier
   */
  private getDepthModifier(scenarioType: string, parameters: any = {}, progress: number): number {
    const intensity = parameters.intensity || 0.5;
    
    switch (scenarioType) {
      case 'bull_market':
        // Depth increases with price
        return 1 + (intensity * 0.5 * progress);
      case 'bear_market':
        // Depth decreases with price
        return 1 - (intensity * 0.3 * progress);
      case 'market_crash':
        // Depth decreases sharply during crash
        const crashPoint = Math.min(1, progress / 0.2);
        return 1 - (intensity * 0.8 * Math.exp(-5 * (crashPoint - 0.5) * (crashPoint - 0.5)));
      case 'sideways_market':
        // Stable depth with minor fluctuations
        return 1 + (0.1 * Math.sin(progress * 10 * Math.PI));
      case 'high_volatility':
        // Erratic depth changes
        return 1 + (intensity * 0.5 * Math.sin(progress * 15 * Math.PI));
      case 'liquidity_crisis':
        // Depth decreases significantly
        return 1 - (intensity * 0.8 * progress);
      case 'flash_crash':
        // Depth disappears during crash
        const flashCrashPhase = progress < 0.1 ? 0 : progress < 0.3 ? (progress - 0.1) / 0.2 : 1;
        const flashCrashRecovery = progress < 0.3 ? 0 : (progress - 0.3) / 0.7;
        
        return 1 - (intensity * 0.9 * flashCrashPhase) + (intensity * 0.7 * flashCrashRecovery);
      default:
        return 1;
    }
  }
  
  /**
   * Get price change based on scenario and progress
   * @param scenarioType Scenario type
   * @param parameters Scenario parameters
   * @param progress Progress through the scenario (0-1)
   * @returns Price change percentage
   */
  private getPriceChange(scenarioType: string, parameters: any = {}, progress: number): number {
    const intensity = parameters.intensity || 0.5;
    
    switch (scenarioType) {
      case 'bull_market':
        return intensity * 5 + (intensity * 5 * Math.random());
      case 'bear_market':
        return -intensity * 5 - (intensity * 5 * Math.random());
      case 'market_crash':
        const crashPoint = Math.min(1, progress / 0.2);
        if (crashPoint < 0.8) {
          return -intensity * 20 - (intensity * 10 * Math.random());
        } else {
          return intensity * 5 + (intensity * 5 * Math.random());
        }
      case 'sideways_market':
        return (Math.random() * 2 - 1) * intensity * 3;
      case 'high_volatility':
        return (Math.random() * 2 - 1) * intensity * 15;
      case 'liquidity_crisis':
        return -intensity * 8 - (intensity * 7 * Math.random());
      case 'flash_crash':
        const flashCrashPhase = progress < 0.1 ? 0 : progress < 0.3 ? (progress - 0.1) / 0.2 : 1;
        if (flashCrashPhase < 0.5) {
          return -intensity * 30 - (intensity * 20 * Math.random());
        } else {
          return intensity * 15 + (intensity * 10 * Math.random());
        }
      default:
        return (Math.random() * 2 - 1) * 5;
    }
  }
  
  /**
   * Generate order book data
   * @param type Order type ('ask' or 'bid')
   * @param price Base price
   * @param levels Number of levels
   * @param depthModifier Depth modifier
   * @returns Order book data
   */
  private generateOrderBook(type: 'ask' | 'bid', price: number, levels: number, depthModifier: number): Array<{ price: number, amount: number }> {
    const result = [];
    
    for (let i = 0; i < levels; i++) {
      const priceOffset = type === 'ask' ? (i + 1) * 0.001 * price : -(i + 1) * 0.001 * price;
      const levelPrice = price + priceOffset;
      
      // Amount decreases as we move away from the base price
      const amount = depthModifier * (1000 - (i * 150)) * (1 + 0.2 * Math.random());
      
      result.push({
        price: levelPrice,
        amount,
      });
    }
    
    return result;
  }
  
  /**
   * Simple hash function
   * @param str String to hash
   * @returns Hash value
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

// DTOs
export class ScenarioInitParamsDto {
  scenarioType: string;
  parameters?: any;
  simulationId: string;
}

export class ScenarioDataSourceDto {
  type: 'scenario';
  scenarioType: string;
  parameters: any;
  duration: number;
  status: 'loading' | 'ready' | 'error';
  metadata: {
    simulationId: string;
    description: string;
    difficulty: string;
    [key: string]: any;
  };
}

export class ScenarioDataQueryDto {
  scenarioType: string;
  parameters?: any;
  startTime: string;
  currentTime: string;
  tokens: string[];
}

export class ScenarioMarketDataDto {
  timestamp: string;
  progress: number;
  tokens: {
    [token: string]: {
      price: number;
      priceChange24h: number;
      volume: number;
      marketDepth: {
        asks: Array<{ price: number, amount: number }>;
        bids: Array<{ price: number, amount: number }>;
      };
      [key: string]: any;
    };
  };
  marketMetrics: {
    volatilityIndex: number;
    liquidityIndex: number;
    sentimentIndex: number;
    [key: string]: any;
  };
}

export class ScenarioListDto {
  scenarios: Array<{
    type: string;
    description: string;
    parameters: string[];
    difficulty: string;
  }>;
}
