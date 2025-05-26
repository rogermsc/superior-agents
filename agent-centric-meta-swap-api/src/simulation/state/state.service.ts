import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for managing simulation state persistence
 * Enables saving, loading, and restoring simulation states
 */
@Injectable()
export class StateService {
  // In-memory store for simulation states
  // In a production environment, this would use a database
  private stateStore: Map<string, SimulationStateData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Save current simulation state
   * @param params State save parameters
   * @returns Saved state information
   */
  async saveState(params: StateSaveParamsDto): Promise<StateInfoDto> {
    // Generate a unique state ID if not provided
    const stateId = params.stateId || this.generateStateId();
    
    // Create state data
    const stateData: SimulationStateData = {
      stateId,
      simulationId: params.simulationId,
      timestamp: new Date().toISOString(),
      name: params.name || `State ${stateId}`,
      description: params.description || '',
      data: params.data,
      metadata: {
        createdBy: params.agentId,
        tags: params.tags || [],
      }
    };
    
    // Store state data
    this.stateStore.set(stateId, stateData);
    
    // Return state information
    return {
      stateId,
      simulationId: stateData.simulationId,
      timestamp: stateData.timestamp,
      name: stateData.name,
      description: stateData.description,
      metadata: stateData.metadata,
    };
  }
  
  /**
   * Load a saved simulation state
   * @param stateId The state's unique identifier
   * @returns Loaded state data
   */
  async loadState(stateId: string): Promise<SimulationStateData> {
    // Get state data
    const stateData = this.getStateData(stateId);
    
    // Return state data
    return stateData;
  }
  
  /**
   * List saved states for a simulation
   * @param simulationId The simulation's unique identifier
   * @returns List of saved states
   */
  async listStates(simulationId: string): Promise<StateListDto> {
    // Filter states by simulation ID
    const states = Array.from(this.stateStore.values())
      .filter(state => state.simulationId === simulationId)
      .map(state => ({
        stateId: state.stateId,
        timestamp: state.timestamp,
        name: state.name,
        description: state.description,
        metadata: state.metadata,
      }));
    
    return {
      simulationId,
      states,
    };
  }
  
  /**
   * Delete a saved state
   * @param stateId The state's unique identifier
   * @returns Success status
   */
  async deleteState(stateId: string): Promise<{ success: boolean }> {
    // Check if state exists
    if (!this.stateStore.has(stateId)) {
      throw new Error(`State not found: ${stateId}`);
    }
    
    // Delete state
    this.stateStore.delete(stateId);
    
    return { success: true };
  }
  
  /**
   * Get state data
   * @param stateId The state's unique identifier
   * @returns State data
   * @throws Error if state not found
   */
  private getStateData(stateId: string): SimulationStateData {
    const stateData = this.stateStore.get(stateId);
    if (!stateData) {
      throw new Error(`State not found: ${stateId}`);
    }
    return stateData;
  }
  
  /**
   * Generate a unique state ID
   * @returns Unique state ID
   */
  private generateStateId(): string {
    return `state_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
export interface SimulationStateData {
  stateId: string;
  simulationId: string;
  timestamp: string;
  name: string;
  description: string;
  data: any;
  metadata: {
    createdBy: string;
    tags: string[];
    [key: string]: any;
  };
}

// DTOs
export class StateSaveParamsDto {
  simulationId: string;
  agentId: string;
  data: any;
  stateId?: string;
  name?: string;
  description?: string;
  tags?: string[];
}

export class StateInfoDto {
  stateId: string;
  simulationId: string;
  timestamp: string;
  name: string;
  description: string;
  metadata: {
    createdBy: string;
    tags: string[];
    [key: string]: any;
  };
}

export class StateListDto {
  simulationId: string;
  states: StateInfoDto[];
}
