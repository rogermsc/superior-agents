import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for coordinating multiple agents in a collaborative environment
 * Manages agent interactions, task allocation, and collaborative learning
 */
@Injectable()
export class CoordinationService {
  // In-memory store for coordination data
  // In a production environment, this would use a database
  private agentPoolStore: Map<string, AgentPoolData> = new Map();
  private taskAllocationStore: Map<string, TaskAllocationData> = new Map();
  private collaborationSessionStore: Map<string, CollaborationSessionData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Create a new agent pool
   * @param params Agent pool creation parameters
   * @returns Created agent pool information
   */
  async createAgentPool(params: CreateAgentPoolDto): Promise<AgentPoolInfoDto> {
    // Generate pool ID
    const poolId = this.generatePoolId();
    
    // Create agent pool data
    const poolData: AgentPoolData = {
      poolId,
      name: params.name,
      description: params.description,
      createdAt: new Date().toISOString(),
      agents: [],
      specializations: params.specializations || [],
      collaborationRules: params.collaborationRules || {
        communicationFrequency: 'medium',
        knowledgeSharingLevel: 'medium',
        consensusThreshold: 0.7,
      },
    };
    
    // Store agent pool data
    this.agentPoolStore.set(poolId, poolData);
    
    // Return agent pool information
    return {
      poolId,
      name: poolData.name,
      description: poolData.description,
      createdAt: poolData.createdAt,
      agentCount: 0,
      specializations: poolData.specializations,
    };
  }
  
  /**
   * Add agent to pool
   * @param params Add agent parameters
   * @returns Updated agent pool information
   */
  async addAgentToPool(params: AddAgentToPoolDto): Promise<AgentPoolInfoDto> {
    // Get agent pool data
    const poolData = this.getAgentPoolData(params.poolId);
    
    // Check if agent already exists in pool
    const existingAgentIndex = poolData.agents.findIndex(agent => agent.agentId === params.agentId);
    if (existingAgentIndex >= 0) {
      throw new Error(`Agent already exists in pool: ${params.agentId}`);
    }
    
    // Add agent to pool
    poolData.agents.push({
      agentId: params.agentId,
      name: params.name,
      specializations: params.specializations || [],
      capabilities: params.capabilities || {},
      joinedAt: new Date().toISOString(),
    });
    
    // Return updated agent pool information
    return {
      poolId: poolData.poolId,
      name: poolData.name,
      description: poolData.description,
      createdAt: poolData.createdAt,
      agentCount: poolData.agents.length,
      specializations: poolData.specializations,
    };
  }
  
  /**
   * Get agent pool details
   * @param poolId The agent pool's unique identifier
   * @returns Agent pool details
   */
  async getAgentPoolDetails(poolId: string): Promise<AgentPoolDetailsDto> {
    // Get agent pool data
    const poolData = this.getAgentPoolData(poolId);
    
    // Return agent pool details
    return {
      poolId: poolData.poolId,
      name: poolData.name,
      description: poolData.description,
      createdAt: poolData.createdAt,
      agents: poolData.agents.map(agent => ({
        agentId: agent.agentId,
        name: agent.name,
        specializations: agent.specializations,
        joinedAt: agent.joinedAt,
      })),
      specializations: poolData.specializations,
      collaborationRules: poolData.collaborationRules,
    };
  }
  
  /**
   * Create a new task allocation
   * @param params Task allocation creation parameters
   * @returns Created task allocation information
   */
  async createTaskAllocation(params: CreateTaskAllocationDto): Promise<TaskAllocationInfoDto> {
    // Get agent pool data
    const poolData = this.getAgentPoolData(params.poolId);
    
    // Generate task ID
    const taskId = this.generateTaskId();
    
    // Allocate task to agents based on specialization and capabilities
    const allocatedAgents = this.allocateTaskToAgents(poolData, params);
    
    // Create task allocation data
    const taskData: TaskAllocationData = {
      taskId,
      poolId: params.poolId,
      name: params.name,
      description: params.description,
      createdAt: new Date().toISOString(),
      status: 'pending',
      requiredSpecializations: params.requiredSpecializations || [],
      parameters: params.parameters || {},
      allocatedAgents,
      results: [],
    };
    
    // Store task allocation data
    this.taskAllocationStore.set(taskId, taskData);
    
    // Return task allocation information
    return {
      taskId,
      poolId: taskData.poolId,
      name: taskData.name,
      description: taskData.description,
      createdAt: taskData.createdAt,
      status: taskData.status,
      agentCount: allocatedAgents.length,
    };
  }
  
  /**
   * Get task allocation details
   * @param taskId The task's unique identifier
   * @returns Task allocation details
   */
  async getTaskAllocationDetails(taskId: string): Promise<TaskAllocationDetailsDto> {
    // Get task allocation data
    const taskData = this.getTaskAllocationData(taskId);
    
    // Return task allocation details
    return {
      taskId: taskData.taskId,
      poolId: taskData.poolId,
      name: taskData.name,
      description: taskData.description,
      createdAt: taskData.createdAt,
      status: taskData.status,
      requiredSpecializations: taskData.requiredSpecializations,
      parameters: taskData.parameters,
      allocatedAgents: taskData.allocatedAgents.map(agent => ({
        agentId: agent.agentId,
        name: agent.name,
        specializations: agent.specializations,
        role: agent.role,
      })),
      results: taskData.results,
    };
  }
  
  /**
   * Submit task result
   * @param params Task result submission parameters
   * @returns Updated task allocation information
   */
  async submitTaskResult(params: SubmitTaskResultDto): Promise<TaskAllocationInfoDto> {
    // Get task allocation data
    const taskData = this.getTaskAllocationData(params.taskId);
    
    // Check if agent is allocated to task
    const allocatedAgent = taskData.allocatedAgents.find(agent => agent.agentId === params.agentId);
    if (!allocatedAgent) {
      throw new Error(`Agent not allocated to task: ${params.agentId}`);
    }
    
    // Add result to task
    taskData.results.push({
      agentId: params.agentId,
      timestamp: new Date().toISOString(),
      result: params.result,
      confidence: params.confidence,
    });
    
    // Check if all agents have submitted results
    const allAgentsSubmitted = taskData.allocatedAgents.every(agent => 
      taskData.results.some(result => result.agentId === agent.agentId)
    );
    
    // Update task status if all agents have submitted
    if (allAgentsSubmitted) {
      taskData.status = 'completed';
    }
    
    // Return updated task allocation information
    return {
      taskId: taskData.taskId,
      poolId: taskData.poolId,
      name: taskData.name,
      description: taskData.description,
      createdAt: taskData.createdAt,
      status: taskData.status,
      agentCount: taskData.allocatedAgents.length,
    };
  }
  
  /**
   * Create a new collaboration session
   * @param params Collaboration session creation parameters
   * @returns Created collaboration session information
   */
  async createCollaborationSession(params: CreateCollaborationSessionDto): Promise<CollaborationSessionInfoDto> {
    // Get agent pool data
    const poolData = this.getAgentPoolData(params.poolId);
    
    // Generate session ID
    const sessionId = this.generateSessionId();
    
    // Create collaboration session data
    const sessionData: CollaborationSessionData = {
      sessionId,
      poolId: params.poolId,
      name: params.name,
      description: params.description,
      createdAt: new Date().toISOString(),
      status: 'active',
      objective: params.objective,
      parameters: params.parameters || {},
      participatingAgents: params.agentIds.map(agentId => {
        const agent = poolData.agents.find(a => a.agentId === agentId);
        if (!agent) {
          throw new Error(`Agent not found in pool: ${agentId}`);
        }
        return {
          agentId,
          name: agent.name,
          specializations: agent.specializations,
          joinedAt: new Date().toISOString(),
        };
      }),
      messages: [],
      sharedKnowledge: {},
    };
    
    // Store collaboration session data
    this.collaborationSessionStore.set(sessionId, sessionData);
    
    // Return collaboration session information
    return {
      sessionId,
      poolId: sessionData.poolId,
      name: sessionData.name,
      description: sessionData.description,
      createdAt: sessionData.createdAt,
      status: sessionData.status,
      objective: sessionData.objective,
      agentCount: sessionData.participatingAgents.length,
    };
  }
  
  /**
   * Get collaboration session details
   * @param sessionId The session's unique identifier
   * @returns Collaboration session details
   */
  async getCollaborationSessionDetails(sessionId: string): Promise<CollaborationSessionDetailsDto> {
    // Get collaboration session data
    const sessionData = this.getCollaborationSessionData(sessionId);
    
    // Return collaboration session details
    return {
      sessionId: sessionData.sessionId,
      poolId: sessionData.poolId,
      name: sessionData.name,
      description: sessionData.description,
      createdAt: sessionData.createdAt,
      status: sessionData.status,
      objective: sessionData.objective,
      parameters: sessionData.parameters,
      participatingAgents: sessionData.participatingAgents.map(agent => ({
        agentId: agent.agentId,
        name: agent.name,
        specializations: agent.specializations,
        joinedAt: agent.joinedAt,
      })),
      messageCount: sessionData.messages.length,
      knowledgeEntryCount: Object.keys(sessionData.sharedKnowledge).length,
    };
  }
  
  /**
   * Get agent pool data
   * @param poolId The agent pool's unique identifier
   * @returns Agent pool data
   * @throws Error if pool not found
   */
  private getAgentPoolData(poolId: string): AgentPoolData {
    const poolData = this.agentPoolStore.get(poolId);
    if (!poolData) {
      throw new Error(`Agent pool not found: ${poolId}`);
    }
    return poolData;
  }
  
  /**
   * Get task allocation data
   * @param taskId The task's unique identifier
   * @returns Task allocation data
   * @throws Error if task not found
   */
  private getTaskAllocationData(taskId: string): TaskAllocationData {
    const taskData = this.taskAllocationStore.get(taskId);
    if (!taskData) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return taskData;
  }
  
  /**
   * Get collaboration session data
   * @param sessionId The session's unique identifier
   * @returns Collaboration session data
   * @throws Error if session not found
   */
  private getCollaborationSessionData(sessionId: string): CollaborationSessionData {
    const sessionData = this.collaborationSessionStore.get(sessionId);
    if (!sessionData) {
      throw new Error(`Collaboration session not found: ${sessionId}`);
    }
    return sessionData;
  }
  
  /**
   * Allocate task to agents based on specialization and capabilities
   * @param poolData Agent pool data
   * @param params Task allocation creation parameters
   * @returns Allocated agents
   */
  private allocateTaskToAgents(poolData: AgentPoolData, params: CreateTaskAllocationDto): AllocatedAgent[] {
    // If specific agents are provided, use them
    if (params.agentIds && params.agentIds.length > 0) {
      return params.agentIds.map(agentId => {
        const agent = poolData.agents.find(a => a.agentId === agentId);
        if (!agent) {
          throw new Error(`Agent not found in pool: ${agentId}`);
        }
        return {
          agentId,
          name: agent.name,
          specializations: agent.specializations,
          role: 'participant',
        };
      });
    }
    
    // Otherwise, allocate based on specialization and capabilities
    const allocatedAgents: AllocatedAgent[] = [];
    
    // Find agents with required specializations
    if (params.requiredSpecializations && params.requiredSpecializations.length > 0) {
      // For each required specialization, find the best agent
      params.requiredSpecializations.forEach(specialization => {
        // Find agents with this specialization
        const candidateAgents = poolData.agents.filter(agent => 
          agent.specializations.includes(specialization)
        );
        
        if (candidateAgents.length === 0) {
          throw new Error(`No agents found with specialization: ${specialization}`);
        }
        
        // Find the best agent (not already allocated)
        const bestAgent = candidateAgents.find(agent => 
          !allocatedAgents.some(allocated => allocated.agentId === agent.agentId)
        ) || candidateAgents[0];
        
        // Add to allocated agents if not already allocated
        if (!allocatedAgents.some(allocated => allocated.agentId === bestAgent.agentId)) {
          allocatedAgents.push({
            agentId: bestAgent.agentId,
            name: bestAgent.name,
            specializations: bestAgent.specializations,
            role: 'specialist',
          });
        }
      });
    }
    
    // If no agents allocated yet, allocate a random agent
    if (allocatedAgents.length === 0 && poolData.agents.length > 0) {
      const randomAgent = poolData.agents[0];
      allocatedAgents.push({
        agentId: randomAgent.agentId,
        name: randomAgent.name,
        specializations: randomAgent.specializations,
        role: 'participant',
      });
    }
    
    // Designate a coordinator if there are multiple agents
    if (allocatedAgents.length > 1) {
      // Find the agent with the most specializations
      const coordinator = [...allocatedAgents].sort((a, b) => 
        b.specializations.length - a.specializations.length
      )[0];
      
      // Update the coordinator's role
      const coordinatorIndex = allocatedAgents.findIndex(agent => 
        agent.agentId === coordinator.agentId
      );
      
      if (coordinatorIndex >= 0) {
        allocatedAgents[coordinatorIndex].role = 'coordinator';
      }
    }
    
    return allocatedAgents;
  }
  
  /**
   * Generate a unique pool ID
   * @returns Unique pool ID
   */
  private generatePoolId(): string {
    return `pool_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
  
  /**
   * Generate a unique task ID
   * @returns Unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
  
  /**
   * Generate a unique session ID
   * @returns Unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
interface AgentPoolData {
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  agents: PoolAgent[];
  specializations: string[];
  collaborationRules: {
    communicationFrequency: 'low' | 'medium' | 'high';
    knowledgeSharingLevel: 'low' | 'medium' | 'high';
    consensusThreshold: number;
  };
}

interface PoolAgent {
  agentId: string;
  name: string;
  specializations: string[];
  capabilities: any;
  joinedAt: string;
}

interface TaskAllocationData {
  taskId: string;
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  requiredSpecializations: string[];
  parameters: any;
  allocatedAgents: AllocatedAgent[];
  results: TaskResult[];
}

interface AllocatedAgent {
  agentId: string;
  name: string;
  specializations: string[];
  role: 'coordinator' | 'specialist' | 'participant';
}

interface TaskResult {
  agentId: string;
  timestamp: string;
  result: any;
  confidence: number;
}

interface CollaborationSessionData {
  sessionId: string;
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'active' | 'completed' | 'archived';
  objective: string;
  parameters: any;
  participatingAgents: SessionAgent[];
  messages: SessionMessage[];
  sharedKnowledge: { [key: string]: any };
}

interface SessionAgent {
  agentId: string;
  name: string;
  specializations: string[];
  joinedAt: string;
}

interface SessionMessage {
  messageId: string;
  agentId: string;
  timestamp: string;
  content: any;
  type: 'observation' | 'action' | 'knowledge' | 'question' | 'response';
}

// DTOs
export class CreateAgentPoolDto {
  name: string;
  description: string;
  specializations?: string[];
  collaborationRules?: {
    communicationFrequency: 'low' | 'medium' | 'high';
    knowledgeSharingLevel: 'low' | 'medium' | 'high';
    consensusThreshold: number;
  };
}

export class AgentPoolInfoDto {
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  agentCount: number;
  specializations: string[];
}

export class AddAgentToPoolDto {
  poolId: string;
  agentId: string;
  name: string;
  specializations?: string[];
  capabilities?: any;
}

export class AgentPoolDetailsDto {
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  agents: Array<{
    agentId: string;
    name: string;
    specializations: string[];
    joinedAt: string;
  }>;
  specializations: string[];
  collaborationRules: {
    communicationFrequency: 'low' | 'medium' | 'high';
    knowledgeSharingLevel: 'low' | 'medium' | 'high';
    consensusThreshold: number;
  };
}

export class CreateTaskAllocationDto {
  poolId: string;
  name: string;
  description: string;
  requiredSpecializations?: string[];
  parameters?: any;
  agentIds?: string[];
}

export class TaskAllocationInfoDto {
  taskId: string;
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  status: string;
  agentCount: number;
}

export class TaskAllocationDetailsDto {
  taskId: string;
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  status: string;
  requiredSpecializations: string[];
  parameters: any;
  allocatedAgents: Array<{
    agentId: string;
    name: string;
    specializations: string[];
    role: string;
  }>;
  results: Array<{
    agentId: string;
    timestamp: string;
    result: any;
    confidence: number;
  }>;
}

export class SubmitTaskResultDto {
  taskId: string;
  agentId: string;
  result: any;
  confidence: number;
}

export class CreateCollaborationSessionDto {
  poolId: string;
  name: string;
  description: string;
  objective: string;
  parameters?: any;
  agentIds: string[];
}

export class CollaborationSessionInfoDto {
  sessionId: string;
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  status: string;
  objective: string;
  agentCount: number;
}

export class CollaborationSessionDetailsDto {
  sessionId: string;
  poolId: string;
  name: string;
  description: string;
  createdAt: string;
  status: string;
  objective: string;
  parameters: any;
  participatingAgents: Array<{
    agentId: string;
    name: string;
    specializations: string[];
    joinedAt: string;
  }>;
  messageCount: number;
  knowledgeEntryCount: number;
}
