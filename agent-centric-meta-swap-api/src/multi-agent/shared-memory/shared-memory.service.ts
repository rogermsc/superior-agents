import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for shared memory between agents
 * Provides a distributed knowledge base and collaborative memory space
 */
@Injectable()
export class SharedMemoryService {
  // In-memory store for shared memory data
  // In a production environment, this would use a database
  private memorySpaceStore: Map<string, MemorySpaceData> = new Map();
  private knowledgeEntryStore: Map<string, KnowledgeEntryData> = new Map();
  private accessControlStore: Map<string, AccessControlData> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Create a new memory space
   * @param params Memory space creation parameters
   * @returns Created memory space information
   */
  async createMemorySpace(params: CreateMemorySpaceDto): Promise<MemorySpaceInfoDto> {
    // Generate memory space ID
    const spaceId = this.generateSpaceId();
    
    // Create memory space data
    const spaceData: MemorySpaceData = {
      spaceId,
      name: params.name,
      description: params.description,
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      type: params.type || 'general',
      metadata: params.metadata || {},
      entries: [],
    };
    
    // Store memory space data
    this.memorySpaceStore.set(spaceId, spaceData);
    
    // Create access control data
    const accessControlData: AccessControlData = {
      spaceId,
      ownerAgentId: params.createdBy,
      readAccess: params.initialAccess?.readAccess || [params.createdBy],
      writeAccess: params.initialAccess?.writeAccess || [params.createdBy],
      adminAccess: params.initialAccess?.adminAccess || [params.createdBy],
    };
    
    // Store access control data
    this.accessControlStore.set(spaceId, accessControlData);
    
    // Return memory space information
    return {
      spaceId,
      name: spaceData.name,
      description: spaceData.description,
      createdAt: spaceData.createdAt,
      createdBy: spaceData.createdBy,
      type: spaceData.type,
      entryCount: 0,
    };
  }
  
  /**
   * Get memory space details
   * @param params Memory space details parameters
   * @returns Memory space details
   */
  async getMemorySpaceDetails(params: GetMemorySpaceDetailsDto): Promise<MemorySpaceDetailsDto> {
    // Get memory space data
    const spaceData = this.getMemorySpaceData(params.spaceId);
    
    // Get access control data
    const accessControlData = this.getAccessControlData(params.spaceId);
    
    // Check if agent has read access
    if (!this.hasReadAccess(accessControlData, params.agentId)) {
      throw new Error(`Agent does not have read access to memory space: ${params.agentId}`);
    }
    
    // Return memory space details
    return {
      spaceId: spaceData.spaceId,
      name: spaceData.name,
      description: spaceData.description,
      createdAt: spaceData.createdAt,
      createdBy: spaceData.createdBy,
      type: spaceData.type,
      metadata: spaceData.metadata,
      entryCount: spaceData.entries.length,
      accessControl: {
        readAccess: accessControlData.readAccess,
        writeAccess: accessControlData.writeAccess,
        adminAccess: accessControlData.adminAccess,
      },
    };
  }
  
  /**
   * Add knowledge entry to memory space
   * @param params Knowledge entry creation parameters
   * @returns Created knowledge entry information
   */
  async addKnowledgeEntry(params: AddKnowledgeEntryDto): Promise<KnowledgeEntryInfoDto> {
    // Get memory space data
    const spaceData = this.getMemorySpaceData(params.spaceId);
    
    // Get access control data
    const accessControlData = this.getAccessControlData(params.spaceId);
    
    // Check if agent has write access
    if (!this.hasWriteAccess(accessControlData, params.agentId)) {
      throw new Error(`Agent does not have write access to memory space: ${params.agentId}`);
    }
    
    // Generate entry ID
    const entryId = this.generateEntryId();
    
    // Create knowledge entry data
    const entryData: KnowledgeEntryData = {
      entryId,
      spaceId: params.spaceId,
      key: params.key,
      value: params.value,
      createdAt: new Date().toISOString(),
      createdBy: params.agentId,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: params.agentId,
      metadata: params.metadata || {},
      tags: params.tags || [],
      confidence: params.confidence || 1.0,
      ttl: params.ttl,
    };
    
    // Store knowledge entry data
    this.knowledgeEntryStore.set(entryId, entryData);
    
    // Add entry to memory space
    spaceData.entries.push(entryId);
    
    // Return knowledge entry information
    return {
      entryId,
      spaceId: entryData.spaceId,
      key: entryData.key,
      createdAt: entryData.createdAt,
      createdBy: entryData.createdBy,
      lastModifiedAt: entryData.lastModifiedAt,
      lastModifiedBy: entryData.lastModifiedBy,
      tags: entryData.tags,
      confidence: entryData.confidence,
    };
  }
  
  /**
   * Update knowledge entry
   * @param params Knowledge entry update parameters
   * @returns Updated knowledge entry information
   */
  async updateKnowledgeEntry(params: UpdateKnowledgeEntryDto): Promise<KnowledgeEntryInfoDto> {
    // Get knowledge entry data
    const entryData = this.getKnowledgeEntryData(params.entryId);
    
    // Get access control data
    const accessControlData = this.getAccessControlData(entryData.spaceId);
    
    // Check if agent has write access
    if (!this.hasWriteAccess(accessControlData, params.agentId)) {
      throw new Error(`Agent does not have write access to memory space: ${params.agentId}`);
    }
    
    // Update knowledge entry data
    if (params.value !== undefined) {
      entryData.value = params.value;
    }
    
    if (params.metadata !== undefined) {
      entryData.metadata = params.metadata;
    }
    
    if (params.tags !== undefined) {
      entryData.tags = params.tags;
    }
    
    if (params.confidence !== undefined) {
      entryData.confidence = params.confidence;
    }
    
    if (params.ttl !== undefined) {
      entryData.ttl = params.ttl;
    }
    
    // Update modification timestamp and agent
    entryData.lastModifiedAt = new Date().toISOString();
    entryData.lastModifiedBy = params.agentId;
    
    // Return updated knowledge entry information
    return {
      entryId: entryData.entryId,
      spaceId: entryData.spaceId,
      key: entryData.key,
      createdAt: entryData.createdAt,
      createdBy: entryData.createdBy,
      lastModifiedAt: entryData.lastModifiedAt,
      lastModifiedBy: entryData.lastModifiedBy,
      tags: entryData.tags,
      confidence: entryData.confidence,
    };
  }
  
  /**
   * Get knowledge entry
   * @param params Knowledge entry retrieval parameters
   * @returns Knowledge entry
   */
  async getKnowledgeEntry(params: GetKnowledgeEntryDto): Promise<KnowledgeEntryDto> {
    // Get knowledge entry data
    const entryData = this.getKnowledgeEntryData(params.entryId);
    
    // Get access control data
    const accessControlData = this.getAccessControlData(entryData.spaceId);
    
    // Check if agent has read access
    if (!this.hasReadAccess(accessControlData, params.agentId)) {
      throw new Error(`Agent does not have read access to memory space: ${params.agentId}`);
    }
    
    // Check if entry has expired
    if (this.isEntryExpired(entryData)) {
      throw new Error(`Knowledge entry has expired: ${params.entryId}`);
    }
    
    // Return knowledge entry
    return {
      entryId: entryData.entryId,
      spaceId: entryData.spaceId,
      key: entryData.key,
      value: entryData.value,
      createdAt: entryData.createdAt,
      createdBy: entryData.createdBy,
      lastModifiedAt: entryData.lastModifiedAt,
      lastModifiedBy: entryData.lastModifiedBy,
      metadata: entryData.metadata,
      tags: entryData.tags,
      confidence: entryData.confidence,
    };
  }
  
  /**
   * Query knowledge entries
   * @param params Knowledge entry query parameters
   * @returns Knowledge entries
   */
  async queryKnowledgeEntries(params: QueryKnowledgeEntriesDto): Promise<KnowledgeEntriesDto> {
    // Get memory space data
    const spaceData = this.getMemorySpaceData(params.spaceId);
    
    // Get access control data
    const accessControlData = this.getAccessControlData(params.spaceId);
    
    // Check if agent has read access
    if (!this.hasReadAccess(accessControlData, params.agentId)) {
      throw new Error(`Agent does not have read access to memory space: ${params.agentId}`);
    }
    
    // Get all entries for the memory space
    const entries = spaceData.entries
      .map(entryId => this.knowledgeEntryStore.get(entryId))
      .filter(entry => entry !== undefined && !this.isEntryExpired(entry));
    
    // Filter entries by key pattern
    let filteredEntries = entries;
    if (params.keyPattern) {
      const regex = new RegExp(params.keyPattern);
      filteredEntries = filteredEntries.filter(entry => regex.test(entry.key));
    }
    
    // Filter entries by tags
    if (params.tags && params.tags.length > 0) {
      filteredEntries = filteredEntries.filter(entry => 
        params.tags.every(tag => entry.tags.includes(tag))
      );
    }
    
    // Filter entries by minimum confidence
    if (params.minConfidence !== undefined) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.confidence >= params.minConfidence
      );
    }
    
    // Sort entries
    if (params.sortBy) {
      filteredEntries.sort((a, b) => {
        if (params.sortBy === 'key') {
          return a.key.localeCompare(b.key);
        } else if (params.sortBy === 'createdAt') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (params.sortBy === 'lastModifiedAt') {
          return new Date(a.lastModifiedAt).getTime() - new Date(b.lastModifiedAt).getTime();
        } else if (params.sortBy === 'confidence') {
          return a.confidence - b.confidence;
        }
        return 0;
      });
      
      // Apply sort direction
      if (params.sortDirection === 'desc') {
        filteredEntries.reverse();
      }
    }
    
    // Apply pagination
    const limit = params.limit || 100;
    const offset = params.offset || 0;
    const paginatedEntries = filteredEntries.slice(offset, offset + limit);
    
    // Return knowledge entries
    return {
      spaceId: params.spaceId,
      totalCount: filteredEntries.length,
      offset,
      limit,
      entries: paginatedEntries.map(entry => ({
        entryId: entry.entryId,
        key: entry.key,
        value: entry.value,
        createdAt: entry.createdAt,
        createdBy: entry.createdBy,
        lastModifiedAt: entry.lastModifiedAt,
        lastModifiedBy: entry.lastModifiedBy,
        metadata: entry.metadata,
        tags: entry.tags,
        confidence: entry.confidence,
      })),
    };
  }
  
  /**
   * Update memory space access control
   * @param params Access control update parameters
   * @returns Updated access control information
   */
  async updateAccessControl(params: UpdateAccessControlDto): Promise<AccessControlInfoDto> {
    // Get access control data
    const accessControlData = this.getAccessControlData(params.spaceId);
    
    // Check if agent has admin access
    if (!this.hasAdminAccess(accessControlData, params.agentId)) {
      throw new Error(`Agent does not have admin access to memory space: ${params.agentId}`);
    }
    
    // Update access control data
    if (params.readAccess !== undefined) {
      accessControlData.readAccess = params.readAccess;
    }
    
    if (params.writeAccess !== undefined) {
      accessControlData.writeAccess = params.writeAccess;
    }
    
    if (params.adminAccess !== undefined) {
      // Ensure the owner always has admin access
      if (!params.adminAccess.includes(accessControlData.ownerAgentId)) {
        params.adminAccess.push(accessControlData.ownerAgentId);
      }
      
      accessControlData.adminAccess = params.adminAccess;
    }
    
    // Return updated access control information
    return {
      spaceId: accessControlData.spaceId,
      ownerAgentId: accessControlData.ownerAgentId,
      readAccess: accessControlData.readAccess,
      writeAccess: accessControlData.writeAccess,
      adminAccess: accessControlData.adminAccess,
    };
  }
  
  /**
   * Get memory space data
   * @param spaceId The memory space's unique identifier
   * @returns Memory space data
   * @throws Error if memory space not found
   */
  private getMemorySpaceData(spaceId: string): MemorySpaceData {
    const spaceData = this.memorySpaceStore.get(spaceId);
    if (!spaceData) {
      throw new Error(`Memory space not found: ${spaceId}`);
    }
    return spaceData;
  }
  
  /**
   * Get knowledge entry data
   * @param entryId The knowledge entry's unique identifier
   * @returns Knowledge entry data
   * @throws Error if knowledge entry not found
   */
  private getKnowledgeEntryData(entryId: string): KnowledgeEntryData {
    const entryData = this.knowledgeEntryStore.get(entryId);
    if (!entryData) {
      throw new Error(`Knowledge entry not found: ${entryId}`);
    }
    return entryData;
  }
  
  /**
   * Get access control data
   * @param spaceId The memory space's unique identifier
   * @returns Access control data
   * @throws Error if access control not found
   */
  private getAccessControlData(spaceId: string): AccessControlData {
    const accessControlData = this.accessControlStore.get(spaceId);
    if (!accessControlData) {
      throw new Error(`Access control not found for memory space: ${spaceId}`);
    }
    return accessControlData;
  }
  
  /**
   * Check if agent has read access to memory space
   * @param accessControlData Access control data
   * @param agentId The agent's unique identifier
   * @returns Whether agent has read access
   */
  private hasReadAccess(accessControlData: AccessControlData, agentId: string): boolean {
    return accessControlData.readAccess.includes(agentId) ||
           accessControlData.writeAccess.includes(agentId) ||
           accessControlData.adminAccess.includes(agentId);
  }
  
  /**
   * Check if agent has write access to memory space
   * @param accessControlData Access control data
   * @param agentId The agent's unique identifier
   * @returns Whether agent has write access
   */
  private hasWriteAccess(accessControlData: AccessControlData, agentId: string): boolean {
    return accessControlData.writeAccess.includes(agentId) ||
           accessControlData.adminAccess.includes(agentId);
  }
  
  /**
   * Check if agent has admin access to memory space
   * @param accessControlData Access control data
   * @param agentId The agent's unique identifier
   * @returns Whether agent has admin access
   */
  private hasAdminAccess(accessControlData: AccessControlData, agentId: string): boolean {
    return accessControlData.adminAccess.includes(agentId);
  }
  
  /**
   * Check if knowledge entry has expired
   * @param entryData Knowledge entry data
   * @returns Whether entry has expired
   */
  private isEntryExpired(entryData: KnowledgeEntryData): boolean {
    if (!entryData.ttl) {
      return false;
    }
    
    const expirationTime = new Date(entryData.lastModifiedAt).getTime() + entryData.ttl * 1000;
    return Date.now() > expirationTime;
  }
  
  /**
   * Generate a unique space ID
   * @returns Unique space ID
   */
  private generateSpaceId(): string {
    return `space_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
  
  /**
   * Generate a unique entry ID
   * @returns Unique entry ID
   */
  private generateEntryId(): string {
    return `entry_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
interface MemorySpaceData {
  spaceId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  type: string;
  metadata: any;
  entries: string[];
}

interface KnowledgeEntryData {
  entryId: string;
  spaceId: string;
  key: string;
  value: any;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  metadata: any;
  tags: string[];
  confidence: number;
  ttl?: number;
}

interface AccessControlData {
  spaceId: string;
  ownerAgentId: string;
  readAccess: string[];
  writeAccess: string[];
  adminAccess: string[];
}

// DTOs
export class CreateMemorySpaceDto {
  name: string;
  description: string;
  createdBy: string;
  type?: string;
  metadata?: any;
  initialAccess?: {
    readAccess?: string[];
    writeAccess?: string[];
    adminAccess?: string[];
  };
}

export class MemorySpaceInfoDto {
  spaceId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  type: string;
  entryCount: number;
}

export class GetMemorySpaceDetailsDto {
  spaceId: string;
  agentId: string;
}

export class MemorySpaceDetailsDto {
  spaceId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  type: string;
  metadata: any;
  entryCount: number;
  accessControl: {
    readAccess: string[];
    writeAccess: string[];
    adminAccess: string[];
  };
}

export class AddKnowledgeEntryDto {
  spaceId: string;
  agentId: string;
  key: string;
  value: any;
  metadata?: any;
  tags?: string[];
  confidence?: number;
  ttl?: number;
}

export class KnowledgeEntryInfoDto {
  entryId: string;
  spaceId: string;
  key: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  tags: string[];
  confidence: number;
}

export class UpdateKnowledgeEntryDto {
  entryId: string;
  agentId: string;
  value?: any;
  metadata?: any;
  tags?: string[];
  confidence?: number;
  ttl?: number;
}

export class GetKnowledgeEntryDto {
  entryId: string;
  agentId: string;
}

export class KnowledgeEntryDto {
  entryId: string;
  spaceId: string;
  key: string;
  value: any;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  metadata: any;
  tags: string[];
  confidence: number;
}

export class QueryKnowledgeEntriesDto {
  spaceId: string;
  agentId: string;
  keyPattern?: string;
  tags?: string[];
  minConfidence?: number;
  sortBy?: 'key' | 'createdAt' | 'lastModifiedAt' | 'confidence';
  sortDirection?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

export class KnowledgeEntriesDto {
  spaceId: string;
  totalCount: number;
  offset: number;
  limit: number;
  entries: KnowledgeEntryDto[];
}

export class UpdateAccessControlDto {
  spaceId: string;
  agentId: string;
  readAccess?: string[];
  writeAccess?: string[];
  adminAccess?: string[];
}

export class AccessControlInfoDto {
  spaceId: string;
  ownerAgentId: string;
  readAccess: string[];
  writeAccess: string[];
  adminAccess: string[];
}
