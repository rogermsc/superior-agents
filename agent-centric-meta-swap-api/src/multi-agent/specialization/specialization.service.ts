import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for agent specialization management
 * Enables agents to develop, track, and leverage specialized capabilities
 */
@Injectable()
export class SpecializationService {
  // In-memory store for specialization data
  // In a production environment, this would use a database
  private specializationStore: Map<string, SpecializationData> = new Map();
  private agentSpecializationStore: Map<string, AgentSpecializationData> = new Map();
  private specializationMetricsStore: Map<string, SpecializationMetricsData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Create a new specialization domain
   * @param params Specialization creation parameters
   * @returns Created specialization information
   */
  async createSpecialization(params: CreateSpecializationDto): Promise<SpecializationInfoDto> {
    // Generate specialization ID
    const specializationId = this.generateSpecializationId();
    
    // Create specialization data
    const specializationData: SpecializationData = {
      specializationId,
      name: params.name,
      description: params.description,
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      domain: params.domain,
      capabilities: params.capabilities || [],
      learningPath: params.learningPath || [],
      prerequisites: params.prerequisites || [],
      metadata: params.metadata || {},
    };
    
    // Store specialization data
    this.specializationStore.set(specializationId, specializationData);
    
    // Initialize metrics data
    const metricsData: SpecializationMetricsData = {
      specializationId,
      agentCount: 0,
      averageProficiency: 0,
      topPerformers: [],
      lastUpdated: new Date().toISOString(),
    };
    
    // Store metrics data
    this.specializationMetricsStore.set(specializationId, metricsData);
    
    // Return specialization information
    return {
      specializationId,
      name: specializationData.name,
      description: specializationData.description,
      createdAt: specializationData.createdAt,
      domain: specializationData.domain,
      capabilityCount: specializationData.capabilities.length,
    };
  }
  
  /**
   * Get specialization details
   * @param params Specialization details parameters
   * @returns Specialization details
   */
  async getSpecializationDetails(params: GetSpecializationDetailsDto): Promise<SpecializationDetailsDto> {
    // Get specialization data
    const specializationData = this.getSpecializationData(params.specializationId);
    
    // Get metrics data
    const metricsData = this.getSpecializationMetricsData(params.specializationId);
    
    // Return specialization details
    return {
      specializationId: specializationData.specializationId,
      name: specializationData.name,
      description: specializationData.description,
      createdAt: specializationData.createdAt,
      createdBy: specializationData.createdBy,
      domain: specializationData.domain,
      capabilities: specializationData.capabilities,
      learningPath: specializationData.learningPath,
      prerequisites: specializationData.prerequisites,
      metadata: specializationData.metadata,
      metrics: {
        agentCount: metricsData.agentCount,
        averageProficiency: metricsData.averageProficiency,
        topPerformers: metricsData.topPerformers,
        lastUpdated: metricsData.lastUpdated,
      },
    };
  }
  
  /**
   * Register agent specialization
   * @param params Agent specialization registration parameters
   * @returns Agent specialization information
   */
  async registerAgentSpecialization(params: RegisterAgentSpecializationDto): Promise<AgentSpecializationInfoDto> {
    // Get specialization data
    const specializationData = this.getSpecializationData(params.specializationId);
    
    // Generate agent specialization ID
    const agentSpecializationId = this.generateAgentSpecializationId();
    
    // Create agent specialization data
    const agentSpecializationData: AgentSpecializationData = {
      agentSpecializationId,
      agentId: params.agentId,
      specializationId: params.specializationId,
      registeredAt: new Date().toISOString(),
      proficiencyLevel: params.initialProficiency || 0.1,
      capabilities: params.capabilities || [],
      trainingHistory: [],
      achievements: [],
      metadata: params.metadata || {},
    };
    
    // Store agent specialization data
    this.agentSpecializationStore.set(agentSpecializationId, agentSpecializationData);
    
    // Update metrics data
    this.updateSpecializationMetrics(params.specializationId);
    
    // Return agent specialization information
    return {
      agentSpecializationId,
      agentId: agentSpecializationData.agentId,
      specializationId: agentSpecializationData.specializationId,
      specializationName: specializationData.name,
      registeredAt: agentSpecializationData.registeredAt,
      proficiencyLevel: agentSpecializationData.proficiencyLevel,
      capabilityCount: agentSpecializationData.capabilities.length,
    };
  }
  
  /**
   * Update agent proficiency
   * @param params Agent proficiency update parameters
   * @returns Updated agent specialization information
   */
  async updateAgentProficiency(params: UpdateAgentProficiencyDto): Promise<AgentSpecializationInfoDto> {
    // Get agent specialization data
    const agentSpecializationData = this.getAgentSpecializationData(params.agentSpecializationId);
    
    // Get specialization data
    const specializationData = this.getSpecializationData(agentSpecializationData.specializationId);
    
    // Update proficiency level
    agentSpecializationData.proficiencyLevel = params.proficiencyLevel;
    
    // Add training record
    agentSpecializationData.trainingHistory.push({
      timestamp: new Date().toISOString(),
      previousProficiency: agentSpecializationData.proficiencyLevel,
      newProficiency: params.proficiencyLevel,
      trainingContext: params.trainingContext || {},
      evaluationMetrics: params.evaluationMetrics || {},
    });
    
    // Update capabilities if provided
    if (params.capabilities) {
      agentSpecializationData.capabilities = params.capabilities;
    }
    
    // Add achievement if provided
    if (params.achievement) {
      agentSpecializationData.achievements.push({
        timestamp: new Date().toISOString(),
        name: params.achievement.name,
        description: params.achievement.description,
        metrics: params.achievement.metrics || {},
      });
    }
    
    // Update metrics data
    this.updateSpecializationMetrics(agentSpecializationData.specializationId);
    
    // Return updated agent specialization information
    return {
      agentSpecializationId: agentSpecializationData.agentSpecializationId,
      agentId: agentSpecializationData.agentId,
      specializationId: agentSpecializationData.specializationId,
      specializationName: specializationData.name,
      registeredAt: agentSpecializationData.registeredAt,
      proficiencyLevel: agentSpecializationData.proficiencyLevel,
      capabilityCount: agentSpecializationData.capabilities.length,
    };
  }
  
  /**
   * Get agent specialization details
   * @param params Agent specialization details parameters
   * @returns Agent specialization details
   */
  async getAgentSpecializationDetails(params: GetAgentSpecializationDetailsDto): Promise<AgentSpecializationDetailsDto> {
    // Get agent specialization data
    const agentSpecializationData = this.getAgentSpecializationData(params.agentSpecializationId);
    
    // Get specialization data
    const specializationData = this.getSpecializationData(agentSpecializationData.specializationId);
    
    // Return agent specialization details
    return {
      agentSpecializationId: agentSpecializationData.agentSpecializationId,
      agentId: agentSpecializationData.agentId,
      specializationId: agentSpecializationData.specializationId,
      specializationName: specializationData.name,
      registeredAt: agentSpecializationData.registeredAt,
      proficiencyLevel: agentSpecializationData.proficiencyLevel,
      capabilities: agentSpecializationData.capabilities,
      trainingHistory: agentSpecializationData.trainingHistory,
      achievements: agentSpecializationData.achievements,
      metadata: agentSpecializationData.metadata,
    };
  }
  
  /**
   * Find specialized agents
   * @param params Find specialized agents parameters
   * @returns Specialized agents
   */
  async findSpecializedAgents(params: FindSpecializedAgentsDto): Promise<SpecializedAgentsDto> {
    // Get specialization data
    const specializationData = this.getSpecializationData(params.specializationId);
    
    // Find all agent specializations for this specialization
    const agentSpecializations = Array.from(this.agentSpecializationStore.values())
      .filter(agentSpec => agentSpec.specializationId === params.specializationId);
    
    // Filter by minimum proficiency
    let filteredAgentSpecializations = agentSpecializations;
    if (params.minProficiency !== undefined) {
      filteredAgentSpecializations = filteredAgentSpecializations.filter(agentSpec => 
        agentSpec.proficiencyLevel >= params.minProficiency
      );
    }
    
    // Filter by capabilities
    if (params.requiredCapabilities && params.requiredCapabilities.length > 0) {
      filteredAgentSpecializations = filteredAgentSpecializations.filter(agentSpec => 
        params.requiredCapabilities.every(capability => 
          agentSpec.capabilities.some(agentCapability => 
            agentCapability.name === capability
          )
        )
      );
    }
    
    // Sort by proficiency
    filteredAgentSpecializations.sort((a, b) => 
      b.proficiencyLevel - a.proficiencyLevel
    );
    
    // Apply limit
    const limit = params.limit || 10;
    const limitedAgentSpecializations = filteredAgentSpecializations.slice(0, limit);
    
    // Return specialized agents
    return {
      specializationId: params.specializationId,
      specializationName: specializationData.name,
      totalCount: filteredAgentSpecializations.length,
      agents: limitedAgentSpecializations.map(agentSpec => ({
        agentId: agentSpec.agentId,
        agentSpecializationId: agentSpec.agentSpecializationId,
        proficiencyLevel: agentSpec.proficiencyLevel,
        capabilities: agentSpec.capabilities,
        registeredAt: agentSpec.registeredAt,
      })),
    };
  }
  
  /**
   * Get agent specializations
   * @param params Get agent specializations parameters
   * @returns Agent specializations
   */
  async getAgentSpecializations(params: GetAgentSpecializationsDto): Promise<AgentSpecializationsDto> {
    // Find all agent specializations for this agent
    const agentSpecializations = Array.from(this.agentSpecializationStore.values())
      .filter(agentSpec => agentSpec.agentId === params.agentId);
    
    // Get specialization data for each agent specialization
    const specializationDetails = agentSpecializations.map(agentSpec => {
      const specializationData = this.getSpecializationData(agentSpec.specializationId);
      return {
        agentSpecializationId: agentSpec.agentSpecializationId,
        specializationId: agentSpec.specializationId,
        specializationName: specializationData.name,
        domain: specializationData.domain,
        proficiencyLevel: agentSpec.proficiencyLevel,
        registeredAt: agentSpec.registeredAt,
        capabilityCount: agentSpec.capabilities.length,
      };
    });
    
    // Sort by proficiency
    specializationDetails.sort((a, b) => 
      b.proficiencyLevel - a.proficiencyLevel
    );
    
    // Return agent specializations
    return {
      agentId: params.agentId,
      specializationCount: specializationDetails.length,
      specializations: specializationDetails,
    };
  }
  
  /**
   * Get specialization data
   * @param specializationId The specialization's unique identifier
   * @returns Specialization data
   * @throws Error if specialization not found
   */
  private getSpecializationData(specializationId: string): SpecializationData {
    const specializationData = this.specializationStore.get(specializationId);
    if (!specializationData) {
      throw new Error(`Specialization not found: ${specializationId}`);
    }
    return specializationData;
  }
  
  /**
   * Get agent specialization data
   * @param agentSpecializationId The agent specialization's unique identifier
   * @returns Agent specialization data
   * @throws Error if agent specialization not found
   */
  private getAgentSpecializationData(agentSpecializationId: string): AgentSpecializationData {
    const agentSpecializationData = this.agentSpecializationStore.get(agentSpecializationId);
    if (!agentSpecializationData) {
      throw new Error(`Agent specialization not found: ${agentSpecializationId}`);
    }
    return agentSpecializationData;
  }
  
  /**
   * Get specialization metrics data
   * @param specializationId The specialization's unique identifier
   * @returns Specialization metrics data
   * @throws Error if specialization metrics not found
   */
  private getSpecializationMetricsData(specializationId: string): SpecializationMetricsData {
    const metricsData = this.specializationMetricsStore.get(specializationId);
    if (!metricsData) {
      throw new Error(`Specialization metrics not found: ${specializationId}`);
    }
    return metricsData;
  }
  
  /**
   * Update specialization metrics
   * @param specializationId The specialization's unique identifier
   */
  private updateSpecializationMetrics(specializationId: string): void {
    // Get all agent specializations for this specialization
    const agentSpecializations = Array.from(this.agentSpecializationStore.values())
      .filter(agentSpec => agentSpec.specializationId === specializationId);
    
    // Calculate average proficiency
    const totalProficiency = agentSpecializations.reduce(
      (sum, agentSpec) => sum + agentSpec.proficiencyLevel, 
      0
    );
    const averageProficiency = agentSpecializations.length > 0 
      ? totalProficiency / agentSpecializations.length 
      : 0;
    
    // Find top performers
    const sortedAgentSpecializations = [...agentSpecializations]
      .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel);
    
    const topPerformers = sortedAgentSpecializations
      .slice(0, 5)
      .map(agentSpec => ({
        agentId: agentSpec.agentId,
        proficiencyLevel: agentSpec.proficiencyLevel,
      }));
    
    // Update metrics data
    const metricsData = this.getSpecializationMetricsData(specializationId);
    metricsData.agentCount = agentSpecializations.length;
    metricsData.averageProficiency = averageProficiency;
    metricsData.topPerformers = topPerformers;
    metricsData.lastUpdated = new Date().toISOString();
  }
  
  /**
   * Generate a unique specialization ID
   * @returns Unique specialization ID
   */
  private generateSpecializationId(): string {
    return `spec_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
  
  /**
   * Generate a unique agent specialization ID
   * @returns Unique agent specialization ID
   */
  private generateAgentSpecializationId(): string {
    return `agent_spec_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
interface SpecializationData {
  specializationId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  domain: string;
  capabilities: CapabilityDefinition[];
  learningPath: LearningPathStep[];
  prerequisites: string[];
  metadata: any;
}

interface CapabilityDefinition {
  name: string;
  description: string;
  evaluationCriteria?: string[];
  minimumProficiency?: number;
}

interface LearningPathStep {
  name: string;
  description: string;
  resources?: string[];
  evaluationMethod?: string;
  targetProficiency?: number;
}

interface AgentSpecializationData {
  agentSpecializationId: string;
  agentId: string;
  specializationId: string;
  registeredAt: string;
  proficiencyLevel: number;
  capabilities: AgentCapability[];
  trainingHistory: TrainingRecord[];
  achievements: Achievement[];
  metadata: any;
}

interface AgentCapability {
  name: string;
  proficiencyLevel?: number;
  acquiredAt?: string;
}

interface TrainingRecord {
  timestamp: string;
  previousProficiency: number;
  newProficiency: number;
  trainingContext: any;
  evaluationMetrics: any;
}

interface Achievement {
  timestamp: string;
  name: string;
  description: string;
  metrics: any;
}

interface SpecializationMetricsData {
  specializationId: string;
  agentCount: number;
  averageProficiency: number;
  topPerformers: Array<{
    agentId: string;
    proficiencyLevel: number;
  }>;
  lastUpdated: string;
}

// DTOs
export class CreateSpecializationDto {
  name: string;
  description: string;
  createdBy: string;
  domain: string;
  capabilities?: CapabilityDefinition[];
  learningPath?: LearningPathStep[];
  prerequisites?: string[];
  metadata?: any;
}

export class SpecializationInfoDto {
  specializationId: string;
  name: string;
  description: string;
  createdAt: string;
  domain: string;
  capabilityCount: number;
}

export class GetSpecializationDetailsDto {
  specializationId: string;
}

export class SpecializationDetailsDto {
  specializationId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  domain: string;
  capabilities: CapabilityDefinition[];
  learningPath: LearningPathStep[];
  prerequisites: string[];
  metadata: any;
  metrics: {
    agentCount: number;
    averageProficiency: number;
    topPerformers: Array<{
      agentId: string;
      proficiencyLevel: number;
    }>;
    lastUpdated: string;
  };
}

export class RegisterAgentSpecializationDto {
  agentId: string;
  specializationId: string;
  initialProficiency?: number;
  capabilities?: AgentCapability[];
  metadata?: any;
}

export class AgentSpecializationInfoDto {
  agentSpecializationId: string;
  agentId: string;
  specializationId: string;
  specializationName: string;
  registeredAt: string;
  proficiencyLevel: number;
  capabilityCount: number;
}

export class UpdateAgentProficiencyDto {
  agentSpecializationId: string;
  proficiencyLevel: number;
  trainingContext?: any;
  evaluationMetrics?: any;
  capabilities?: AgentCapability[];
  achievement?: {
    name: string;
    description: string;
    metrics?: any;
  };
}

export class GetAgentSpecializationDetailsDto {
  agentSpecializationId: string;
}

export class AgentSpecializationDetailsDto {
  agentSpecializationId: string;
  agentId: string;
  specializationId: string;
  specializationName: string;
  registeredAt: string;
  proficiencyLevel: number;
  capabilities: AgentCapability[];
  trainingHistory: TrainingRecord[];
  achievements: Achievement[];
  metadata: any;
}

export class FindSpecializedAgentsDto {
  specializationId: string;
  minProficiency?: number;
  requiredCapabilities?: string[];
  limit?: number;
}

export class SpecializedAgentsDto {
  specializationId: string;
  specializationName: string;
  totalCount: number;
  agents: Array<{
    agentId: string;
    agentSpecializationId: string;
    proficiencyLevel: number;
    capabilities: AgentCapability[];
    registeredAt: string;
  }>;
}

export class GetAgentSpecializationsDto {
  agentId: string;
}

export class AgentSpecializationsDto {
  agentId: string;
  specializationCount: number;
  specializations: Array<{
    agentSpecializationId: string;
    specializationId: string;
    specializationName: string;
    domain: string;
    proficiencyLevel: number;
    registeredAt: string;
    capabilityCount: number;
  }>;
}
