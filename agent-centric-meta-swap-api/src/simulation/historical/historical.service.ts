import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for managing historical data replay for agent learning
 * Provides access to past market conditions for training
 */
@Injectable()
export class HistoricalService {
  constructor(private configService: ConfigService) {}

  /**
   * Initialize historical data source for a simulation
   * @param params Initialization parameters
   * @returns Historical data source configuration
   */
  async initialize(params: HistoricalInitParamsDto): Promise<HistoricalDataSourceDto> {
    // In a real implementation, this would load and prepare historical data
    // For now, we'll return a structured mock response
    
    // Validate the period
    this.validatePeriod(params.period);
    
    // Validate tokens
    this.validateTokens(params.tokens);
    
    // Create and return the data source configuration
    return {
      type: 'historical',
      period: params.period,
      tokens: params.tokens,
      dataPoints: this.estimateDataPoints(params.period),
      resolution: '1h', // Default resolution
      status: 'ready',
      metadata: {
        simulationId: params.simulationId,
        dataSource: 'synthetic', // In a real implementation, this would be the actual data source
      }
    };
  }
  
  /**
   * Get historical data for a specific time point
   * @param params Query parameters
   * @returns Historical market data
   */
  async getHistoricalData(params: HistoricalDataQueryDto): Promise<HistoricalMarketDataDto> {
    // In a real implementation, this would query a database or API
    // For now, we'll generate synthetic data
    
    const timestamp = new Date(params.timestamp);
    
    // Generate synthetic market data
    const marketData: HistoricalMarketDataDto = {
      timestamp: timestamp.toISOString(),
      tokens: {},
      marketMetrics: {
        totalVolume: Math.floor(Math.random() * 1000000000),
        volatilityIndex: Math.random() * 100,
      }
    };
    
    // Generate data for each token
    for (const token of params.tokens) {
      // Base price that's deterministic based on token and timestamp
      // This ensures consistent prices for the same token and time
      const basePrice = this.getBasePriceForToken(token, timestamp);
      
      marketData.tokens[token] = {
        price: basePrice,
        volume: Math.floor(Math.random() * 10000000),
        marketCap: basePrice * Math.floor(Math.random() * 1000000000),
        supply: Math.floor(Math.random() * 1000000000),
      };
    }
    
    return marketData;
  }
  
  /**
   * Get available time range for historical data
   * @returns Available time range
   */
  async getAvailableTimeRange(): Promise<HistoricalTimeRangeDto> {
    // In a real implementation, this would query a database or API
    // For now, we'll return a fixed range
    
    return {
      earliest: '2020-01-01T00:00:00Z',
      latest: '2023-12-31T23:59:59Z',
      resolutions: ['1m', '5m', '15m', '1h', '4h', '1d'],
    };
  }
  
  /**
   * Validate time period
   * @param period Time period
   * @throws Error if period is invalid
   */
  private validatePeriod(period: { start: string; end: string }): void {
    if (!period) {
      throw new Error('Period is required');
    }
    
    if (!period.start || !period.end) {
      throw new Error('Period must have start and end dates');
    }
    
    const start = new Date(period.start);
    const end = new Date(period.end);
    
    if (isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }
    
    if (isNaN(end.getTime())) {
      throw new Error('Invalid end date');
    }
    
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }
    
    // In a real implementation, we would also check if the dates are within the available range
  }
  
  /**
   * Validate token list
   * @param tokens List of token addresses
   * @throws Error if tokens are invalid
   */
  private validateTokens(tokens: string[]): void {
    if (!tokens || tokens.length === 0) {
      throw new Error('At least one token is required');
    }
    
    // In a real implementation, we would validate each token address
  }
  
  /**
   * Estimate the number of data points for a period
   * @param period Time period
   * @returns Estimated number of data points
   */
  private estimateDataPoints(period: { start: string; end: string }): number {
    const start = new Date(period.start);
    const end = new Date(period.end);
    
    // Calculate hours between dates
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Assuming hourly data points
    return Math.ceil(hours);
  }
  
  /**
   * Get a deterministic base price for a token at a specific time
   * @param token Token address
   * @param timestamp Timestamp
   * @returns Base price
   */
  private getBasePriceForToken(token: string, timestamp: Date): number {
    // Use the token address and timestamp to generate a deterministic price
    // This ensures consistent prices for the same token and time
    
    // Simple hash function for demonstration
    const hash = this.simpleHash(token + timestamp.toISOString());
    
    // Different price ranges for different tokens
    let basePrice = 0;
    if (token.toLowerCase().includes('btc')) {
      basePrice = 30000 + (hash % 20000); // BTC: $30,000 - $50,000
    } else if (token.toLowerCase().includes('eth')) {
      basePrice = 1500 + (hash % 2000); // ETH: $1,500 - $3,500
    } else if (token.toLowerCase().includes('usdc') || token.toLowerCase().includes('usdt')) {
      basePrice = 0.98 + (hash % 5) / 100; // Stablecoins: $0.98 - $1.03
    } else {
      basePrice = 0.1 + (hash % 1000) / 10; // Other tokens: $0.1 - $100.1
    }
    
    return basePrice;
  }
  
  /**
   * Simple hash function for demonstration
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
export class HistoricalInitParamsDto {
  period: {
    start: string;
    end: string;
  };
  tokens: string[];
  simulationId: string;
  resolution?: string;
}

export class HistoricalDataSourceDto {
  type: 'historical';
  period: {
    start: string;
    end: string;
  };
  tokens: string[];
  dataPoints: number;
  resolution: string;
  status: 'loading' | 'ready' | 'error';
  metadata: {
    simulationId: string;
    dataSource: string;
    [key: string]: any;
  };
}

export class HistoricalDataQueryDto {
  timestamp: string;
  tokens: string[];
  resolution?: string;
}

export class HistoricalMarketDataDto {
  timestamp: string;
  tokens: {
    [token: string]: {
      price: number;
      volume: number;
      marketCap: number;
      supply: number;
      [key: string]: any;
    };
  };
  marketMetrics: {
    totalVolume: number;
    volatilityIndex: number;
    [key: string]: any;
  };
}

export class HistoricalTimeRangeDto {
  earliest: string;
  latest: string;
  resolutions: string[];
}
