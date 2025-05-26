import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HistoricalService } from './historical/historical.service';
import { ScenariosService } from './scenarios/scenarios.service';
import { TimeControlService } from './time-control/time-control.service';

/**
 * Main service for managing simulation environments for agent learning
 * Coordinates between historical data, scenarios, and time control
 */
@Injectable()
export class SimulationService {
  constructor(
    private configService: ConfigService,
    private historicalService: HistoricalService,
    private scenariosService: ScenariosService,
    private timeControlService: TimeControlService,
  ) {}

  /**
   * Initialize a new simulation environment
   * @param params Simulation initialization parameters
   * @returns Simulation environment details
   */
  async initializeSimulation(params: SimulationInitParamsDto): Promise<SimulationEnvironmentDto> {
    // Generate a unique simulation ID
    const simulationId = this.generateSimulationId();
    
    // Initialize time control
    const timeControl = await this.timeControlService.initialize({
      startTime: params.startTime,
      timeScale: params.timeScale || 1.0,
      simulationId,
    });
    
    // Initialize data source based on type
    let dataSource;
    if (params.type === 'historical') {
      dataSource = await this.historicalService.initialize({
        period: params.period,
        tokens: params.tokens,
        simulationId,
      });
    } else if (params.type === 'scenario') {
      dataSource = await this.scenariosService.initialize({
        scenarioType: params.scenarioType,
        parameters: params.scenarioParameters,
        simulationId,
      });
    } else {
      throw new Error(`Unsupported simulation type: ${params.type}`);
    }
    
    // Create and return the simulation environment
    const environment: SimulationEnvironmentDto = {
      simulationId,
      type: params.type,
      status: 'initialized',
      timeControl,
      dataSource,
      createdAt: new Date().toISOString(),
      metadata: {
        createdBy: params.agentId,
        description: params.description || '',
      }
    };
    
    // In a real implementation, we would store this in a database
    
    return environment;
  }
  
  /**
   * Get the current state of a simulation environment
   * @param simulationId The simulation's unique identifier
   * @returns Current simulation state
   */
  async getSimulationState(simulationId: string): Promise<SimulationStateDto> {
    // In a real implementation, we would retrieve this from a database
    // For now, we'll return a mock state
    
    return {
      simulationId,
      currentTime: new Date().toISOString(),
      timeScale: 1.0,
      status: 'running',
      marketState: {
        tokens: {
          'ETH': { price: 2500 + Math.random() * 100 },
          'BTC': { price: 40000 + Math.random() * 1000 },
          'USDC': { price: 1.0 },
        },
        gasPrice: 50 + Math.random() * 20,
        blockNumber: 12345678,
      },
      agentState: {
        balance: {
          'ETH': '1.5',
          'USDC': '5000',
        },
        pendingActions: 0,
        completedActions: 5,
      }
    };
  }
  
  /**
   * Pause a running simulation
   * @param simulationId The simulation's unique identifier
   * @returns Updated simulation state
   */
  async pauseSimulation(simulationId: string): Promise<SimulationStateDto> {
    // In a real implementation, we would update the simulation status in a database
    await this.timeControlService.pause(simulationId);
    
    // Return the updated state
    const state = await this.getSimulationState(simulationId);
    state.status = 'paused';
    return state;
  }
  
  /**
   * Resume a paused simulation
   * @param simulationId The simulation's unique identifier
   * @returns Updated simulation state
   */
  async resumeSimulation(simulationId: string): Promise<SimulationStateDto> {
    // In a real implementation, we would update the simulation status in a database
    await this.timeControlService.resume(simulationId);
    
    // Return the updated state
    const state = await this.getSimulationState(simulationId);
    state.status = 'running';
    return state;
  }
  
  /**
   * Reset a simulation to its initial state
   * @param simulationId The simulation's unique identifier
   * @returns Updated simulation state
   */
  async resetSimulation(simulationId: string): Promise<SimulationStateDto> {
    // In a real implementation, we would reset the simulation in a database
    await this.timeControlService.reset(simulationId);
    
    // Return the updated state
    const state = await this.getSimulationState(simulationId);
    state.status = 'initialized';
    return state;
  }
  
  /**
   * Terminate and clean up a simulation
   * @param simulationId The simulation's unique identifier
   * @returns Success status
   */
  async terminateSimulation(simulationId: string): Promise<{ success: boolean }> {
    // In a real implementation, we would delete the simulation from a database
    // and clean up any resources
    
    return { success: true };
  }
  
  /**
   * Generate a unique simulation ID
   * @returns Unique simulation ID
   */
  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// DTOs
export class SimulationInitParamsDto {
  type: 'historical' | 'scenario';
  agentId: string;
  tokens: string[];
  startTime?: string;
  timeScale?: number;
  description?: string;
  
  // Historical simulation parameters
  period?: {
    start: string;
    end: string;
  };
  
  // Scenario simulation parameters
  scenarioType?: string;
  scenarioParameters?: any;
}

export class SimulationEnvironmentDto {
  simulationId: string;
  type: 'historical' | 'scenario';
  status: 'initialized' | 'running' | 'paused' | 'completed';
  timeControl: any;
  dataSource: any;
  createdAt: string;
  metadata: {
    createdBy: string;
    description: string;
    [key: string]: any;
  };
}

export class SimulationStateDto {
  simulationId: string;
  currentTime: string;
  timeScale: number;
  status: 'initialized' | 'running' | 'paused' | 'completed';
  marketState: {
    tokens: {
      [symbol: string]: {
        price: number;
        [key: string]: any;
      };
    };
    gasPrice: number;
    blockNumber: number;
    [key: string]: any;
  };
  agentState: {
    balance: {
      [token: string]: string;
    };
    pendingActions: number;
    completedActions: number;
    [key: string]: any;
  };
}
