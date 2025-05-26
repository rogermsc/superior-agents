import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for controlling simulation time flow
 * Enables time acceleration, pausing, and synchronization
 */
@Injectable()
export class TimeControlService {
  // In-memory store for time control data
  // In a production environment, this would use Redis or another distributed cache
  private timeControlStore: Map<string, TimeControlData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Initialize time control for a simulation
   * @param params Initialization parameters
   * @returns Time control configuration
   */
  async initialize(params: TimeControlInitParamsDto): Promise<TimeControlConfigDto> {
    // Set default start time if not provided
    const startTime = params.startTime ? new Date(params.startTime) : new Date();
    
    // Validate time scale
    const timeScale = this.validateTimeScale(params.timeScale || 1.0);
    
    // Create time control data
    const timeControlData: TimeControlData = {
      simulationId: params.simulationId,
      startTime: startTime.toISOString(),
      currentTime: startTime.toISOString(),
      timeScale,
      status: 'running',
      lastUpdateRealTime: Date.now(),
    };
    
    // Store time control data
    this.timeControlStore.set(params.simulationId, timeControlData);
    
    // Return time control configuration
    return {
      startTime: timeControlData.startTime,
      currentTime: timeControlData.currentTime,
      timeScale: timeControlData.timeScale,
      status: timeControlData.status,
    };
  }
  
  /**
   * Get current simulation time
   * @param simulationId The simulation's unique identifier
   * @returns Current simulation time
   */
  async getCurrentTime(simulationId: string): Promise<TimeInfoDto> {
    // Get time control data
    const timeControlData = this.getTimeControlData(simulationId);
    
    // Update current time if simulation is running
    if (timeControlData.status === 'running') {
      this.updateCurrentTime(timeControlData);
    }
    
    return {
      simulationId,
      currentTime: timeControlData.currentTime,
      timeScale: timeControlData.timeScale,
      status: timeControlData.status,
      realTimeFactor: this.calculateRealTimeFactor(timeControlData),
    };
  }
  
  /**
   * Set time scale for a simulation
   * @param simulationId The simulation's unique identifier
   * @param timeScale New time scale
   * @returns Updated time information
   */
  async setTimeScale(simulationId: string, timeScale: number): Promise<TimeInfoDto> {
    // Get time control data
    const timeControlData = this.getTimeControlData(simulationId);
    
    // Update current time before changing time scale
    if (timeControlData.status === 'running') {
      this.updateCurrentTime(timeControlData);
    }
    
    // Validate and set new time scale
    timeControlData.timeScale = this.validateTimeScale(timeScale);
    
    // Update last update time
    timeControlData.lastUpdateRealTime = Date.now();
    
    return {
      simulationId,
      currentTime: timeControlData.currentTime,
      timeScale: timeControlData.timeScale,
      status: timeControlData.status,
      realTimeFactor: this.calculateRealTimeFactor(timeControlData),
    };
  }
  
  /**
   * Pause a simulation
   * @param simulationId The simulation's unique identifier
   * @returns Updated time information
   */
  async pause(simulationId: string): Promise<TimeInfoDto> {
    // Get time control data
    const timeControlData = this.getTimeControlData(simulationId);
    
    // Update current time before pausing
    if (timeControlData.status === 'running') {
      this.updateCurrentTime(timeControlData);
    }
    
    // Set status to paused
    timeControlData.status = 'paused';
    
    return {
      simulationId,
      currentTime: timeControlData.currentTime,
      timeScale: timeControlData.timeScale,
      status: timeControlData.status,
      realTimeFactor: this.calculateRealTimeFactor(timeControlData),
    };
  }
  
  /**
   * Resume a paused simulation
   * @param simulationId The simulation's unique identifier
   * @returns Updated time information
   */
  async resume(simulationId: string): Promise<TimeInfoDto> {
    // Get time control data
    const timeControlData = this.getTimeControlData(simulationId);
    
    // Set status to running
    timeControlData.status = 'running';
    
    // Update last update time
    timeControlData.lastUpdateRealTime = Date.now();
    
    return {
      simulationId,
      currentTime: timeControlData.currentTime,
      timeScale: timeControlData.timeScale,
      status: timeControlData.status,
      realTimeFactor: this.calculateRealTimeFactor(timeControlData),
    };
  }
  
  /**
   * Reset simulation time to start time
   * @param simulationId The simulation's unique identifier
   * @returns Updated time information
   */
  async reset(simulationId: string): Promise<TimeInfoDto> {
    // Get time control data
    const timeControlData = this.getTimeControlData(simulationId);
    
    // Reset current time to start time
    timeControlData.currentTime = timeControlData.startTime;
    
    // Set status to paused
    timeControlData.status = 'paused';
    
    return {
      simulationId,
      currentTime: timeControlData.currentTime,
      timeScale: timeControlData.timeScale,
      status: timeControlData.status,
      realTimeFactor: this.calculateRealTimeFactor(timeControlData),
    };
  }
  
  /**
   * Set current simulation time
   * @param simulationId The simulation's unique identifier
   * @param timestamp New simulation time
   * @returns Updated time information
   */
  async setCurrentTime(simulationId: string, timestamp: string): Promise<TimeInfoDto> {
    // Get time control data
    const timeControlData = this.getTimeControlData(simulationId);
    
    // Validate timestamp
    const newTime = new Date(timestamp);
    if (isNaN(newTime.getTime())) {
      throw new Error('Invalid timestamp');
    }
    
    // Set current time
    timeControlData.currentTime = newTime.toISOString();
    
    // Update last update time
    timeControlData.lastUpdateRealTime = Date.now();
    
    return {
      simulationId,
      currentTime: timeControlData.currentTime,
      timeScale: timeControlData.timeScale,
      status: timeControlData.status,
      realTimeFactor: this.calculateRealTimeFactor(timeControlData),
    };
  }
  
  /**
   * Get time control data for a simulation
   * @param simulationId The simulation's unique identifier
   * @returns Time control data
   * @throws Error if simulation not found
   */
  private getTimeControlData(simulationId: string): TimeControlData {
    const timeControlData = this.timeControlStore.get(simulationId);
    if (!timeControlData) {
      throw new Error(`Simulation not found: ${simulationId}`);
    }
    return timeControlData;
  }
  
  /**
   * Update current time based on elapsed real time and time scale
   * @param timeControlData Time control data
   */
  private updateCurrentTime(timeControlData: TimeControlData): void {
    // Get elapsed real time since last update
    const now = Date.now();
    const elapsedRealMs = now - timeControlData.lastUpdateRealTime;
    
    // Calculate elapsed simulation time
    const elapsedSimMs = elapsedRealMs * timeControlData.timeScale;
    
    // Update current time
    const currentTime = new Date(timeControlData.currentTime);
    currentTime.setTime(currentTime.getTime() + elapsedSimMs);
    timeControlData.currentTime = currentTime.toISOString();
    
    // Update last update time
    timeControlData.lastUpdateRealTime = now;
  }
  
  /**
   * Validate time scale
   * @param timeScale Time scale
   * @returns Validated time scale
   * @throws Error if time scale is invalid
   */
  private validateTimeScale(timeScale: number): number {
    if (isNaN(timeScale) || timeScale <= 0) {
      throw new Error('Time scale must be a positive number');
    }
    
    // Limit time scale to a reasonable range
    const minTimeScale = 0.1;
    const maxTimeScale = 1000;
    
    return Math.max(minTimeScale, Math.min(maxTimeScale, timeScale));
  }
  
  /**
   * Calculate real time factor
   * @param timeControlData Time control data
   * @returns Real time factor
   */
  private calculateRealTimeFactor(timeControlData: TimeControlData): number {
    // Real time factor is the ratio of simulation time to real time
    // For example, a factor of 2.0 means simulation time is passing twice as fast as real time
    return timeControlData.status === 'running' ? timeControlData.timeScale : 0;
  }
}

// Types
interface TimeControlData {
  simulationId: string;
  startTime: string;
  currentTime: string;
  timeScale: number;
  status: 'running' | 'paused';
  lastUpdateRealTime: number;
}

// DTOs
export class TimeControlInitParamsDto {
  simulationId: string;
  startTime?: string;
  timeScale?: number;
}

export class TimeControlConfigDto {
  startTime: string;
  currentTime: string;
  timeScale: number;
  status: 'running' | 'paused';
}

export class TimeInfoDto {
  simulationId: string;
  currentTime: string;
  timeScale: number;
  status: 'running' | 'paused';
  realTimeFactor: number;
}
