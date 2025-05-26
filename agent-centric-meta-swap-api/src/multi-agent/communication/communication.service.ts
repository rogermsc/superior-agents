import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for agent-to-agent communication
 * Enables message passing, broadcasts, and structured communication protocols
 */
@Injectable()
export class CommunicationService {
  // In-memory store for communication data
  // In a production environment, this would use a database and message queue
  private messageStore: Map<string, MessageData> = new Map();
  private channelStore: Map<string, ChannelData> = new Map();
  private subscriptionStore: Map<string, Set<string>> = new Map(); // channelId -> Set of agentIds

  constructor(private configService: ConfigService) {}

  /**
   * Send a direct message to another agent
   * @param params Message parameters
   * @returns Message information
   */
  async sendDirectMessage(params: SendDirectMessageDto): Promise<MessageInfoDto> {
    // Generate message ID
    const messageId = this.generateMessageId();
    
    // Create message data
    const messageData: MessageData = {
      messageId,
      senderId: params.senderId,
      recipientId: params.recipientId,
      timestamp: new Date().toISOString(),
      content: params.content,
      type: params.type || 'text',
      metadata: params.metadata || {},
      status: 'delivered',
    };
    
    // Store message data
    this.messageStore.set(messageId, messageData);
    
    // Return message information
    return {
      messageId,
      senderId: messageData.senderId,
      recipientId: messageData.recipientId,
      timestamp: messageData.timestamp,
      type: messageData.type,
      status: messageData.status,
    };
  }
  
  /**
   * Get messages for an agent
   * @param params Get messages parameters
   * @returns Messages
   */
  async getMessages(params: GetMessagesDto): Promise<MessagesDto> {
    // Find messages for the agent
    const messages = Array.from(this.messageStore.values())
      .filter(message => 
        (message.recipientId === params.agentId || message.senderId === params.agentId) &&
        (!params.since || new Date(message.timestamp) >= new Date(params.since)) &&
        (!params.type || message.type === params.type)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Return messages
    return {
      agentId: params.agentId,
      messages: messages.map(message => ({
        messageId: message.messageId,
        senderId: message.senderId,
        recipientId: message.recipientId,
        timestamp: message.timestamp,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        status: message.status,
      })),
    };
  }
  
  /**
   * Create a communication channel
   * @param params Channel creation parameters
   * @returns Channel information
   */
  async createChannel(params: CreateChannelDto): Promise<ChannelInfoDto> {
    // Generate channel ID
    const channelId = this.generateChannelId();
    
    // Create channel data
    const channelData: ChannelData = {
      channelId,
      name: params.name,
      description: params.description,
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      type: params.type || 'topic',
      metadata: params.metadata || {},
      messages: [],
    };
    
    // Store channel data
    this.channelStore.set(channelId, channelData);
    
    // Initialize subscription set
    this.subscriptionStore.set(channelId, new Set());
    
    // Return channel information
    return {
      channelId,
      name: channelData.name,
      description: channelData.description,
      createdAt: channelData.createdAt,
      createdBy: channelData.createdBy,
      type: channelData.type,
      subscriberCount: 0,
    };
  }
  
  /**
   * Subscribe to a channel
   * @param params Subscription parameters
   * @returns Subscription information
   */
  async subscribeToChannel(params: SubscribeToChannelDto): Promise<SubscriptionInfoDto> {
    // Get channel data
    const channelData = this.getChannelData(params.channelId);
    
    // Get subscription set
    const subscriptions = this.getSubscriptionSet(params.channelId);
    
    // Add agent to subscription set
    subscriptions.add(params.agentId);
    
    // Return subscription information
    return {
      channelId: params.channelId,
      agentId: params.agentId,
      subscribedAt: new Date().toISOString(),
      channelName: channelData.name,
      channelType: channelData.type,
    };
  }
  
  /**
   * Unsubscribe from a channel
   * @param params Unsubscription parameters
   * @returns Unsubscription information
   */
  async unsubscribeFromChannel(params: UnsubscribeFromChannelDto): Promise<UnsubscriptionInfoDto> {
    // Get channel data
    const channelData = this.getChannelData(params.channelId);
    
    // Get subscription set
    const subscriptions = this.getSubscriptionSet(params.channelId);
    
    // Remove agent from subscription set
    subscriptions.delete(params.agentId);
    
    // Return unsubscription information
    return {
      channelId: params.channelId,
      agentId: params.agentId,
      unsubscribedAt: new Date().toISOString(),
      channelName: channelData.name,
    };
  }
  
  /**
   * Send a message to a channel
   * @param params Channel message parameters
   * @returns Message information
   */
  async sendChannelMessage(params: SendChannelMessageDto): Promise<ChannelMessageInfoDto> {
    // Get channel data
    const channelData = this.getChannelData(params.channelId);
    
    // Get subscription set
    const subscriptions = this.getSubscriptionSet(params.channelId);
    
    // Check if agent is subscribed to channel
    if (!subscriptions.has(params.senderId)) {
      throw new Error(`Agent not subscribed to channel: ${params.senderId}`);
    }
    
    // Generate message ID
    const messageId = this.generateMessageId();
    
    // Create message data
    const messageData: ChannelMessageData = {
      messageId,
      channelId: params.channelId,
      senderId: params.senderId,
      timestamp: new Date().toISOString(),
      content: params.content,
      type: params.type || 'text',
      metadata: params.metadata || {},
    };
    
    // Add message to channel
    channelData.messages.push(messageData);
    
    // Return message information
    return {
      messageId,
      channelId: messageData.channelId,
      senderId: messageData.senderId,
      timestamp: messageData.timestamp,
      type: messageData.type,
      recipientCount: subscriptions.size - 1, // Exclude sender
    };
  }
  
  /**
   * Get channel messages
   * @param params Get channel messages parameters
   * @returns Channel messages
   */
  async getChannelMessages(params: GetChannelMessagesDto): Promise<ChannelMessagesDto> {
    // Get channel data
    const channelData = this.getChannelData(params.channelId);
    
    // Get subscription set
    const subscriptions = this.getSubscriptionSet(params.channelId);
    
    // Check if agent is subscribed to channel
    if (!subscriptions.has(params.agentId)) {
      throw new Error(`Agent not subscribed to channel: ${params.agentId}`);
    }
    
    // Filter messages by timestamp and type
    const messages = channelData.messages
      .filter(message => 
        (!params.since || new Date(message.timestamp) >= new Date(params.since)) &&
        (!params.type || message.type === params.type)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Return channel messages
    return {
      channelId: params.channelId,
      agentId: params.agentId,
      channelName: channelData.name,
      messages: messages.map(message => ({
        messageId: message.messageId,
        senderId: message.senderId,
        timestamp: message.timestamp,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
      })),
    };
  }
  
  /**
   * Broadcast a message to all agents in a pool
   * @param params Broadcast parameters
   * @returns Broadcast information
   */
  async broadcastMessage(params: BroadcastMessageDto): Promise<BroadcastInfoDto> {
    // Generate message ID
    const messageId = this.generateMessageId();
    
    // Create channel if it doesn't exist
    let channelId = `pool_${params.poolId}`;
    if (!this.channelStore.has(channelId)) {
      await this.createChannel({
        name: `Pool ${params.poolId} Broadcast Channel`,
        description: `Broadcast channel for pool ${params.poolId}`,
        createdBy: params.senderId,
        type: 'broadcast',
      });
    }
    
    // Get channel data
    const channelData = this.getChannelData(channelId);
    
    // Create message data
    const messageData: ChannelMessageData = {
      messageId,
      channelId,
      senderId: params.senderId,
      timestamp: new Date().toISOString(),
      content: params.content,
      type: params.type || 'broadcast',
      metadata: {
        ...params.metadata || {},
        poolId: params.poolId,
        priority: params.priority || 'normal',
      },
    };
    
    // Add message to channel
    channelData.messages.push(messageData);
    
    // Return broadcast information
    return {
      messageId,
      poolId: params.poolId,
      senderId: params.senderId,
      timestamp: messageData.timestamp,
      type: messageData.type,
      priority: params.priority || 'normal',
    };
  }
  
  /**
   * Get channel data
   * @param channelId The channel's unique identifier
   * @returns Channel data
   * @throws Error if channel not found
   */
  private getChannelData(channelId: string): ChannelData {
    const channelData = this.channelStore.get(channelId);
    if (!channelData) {
      throw new Error(`Channel not found: ${channelId}`);
    }
    return channelData;
  }
  
  /**
   * Get subscription set
   * @param channelId The channel's unique identifier
   * @returns Subscription set
   * @throws Error if channel not found
   */
  private getSubscriptionSet(channelId: string): Set<string> {
    const subscriptions = this.subscriptionStore.get(channelId);
    if (!subscriptions) {
      throw new Error(`Channel not found: ${channelId}`);
    }
    return subscriptions;
  }
  
  /**
   * Generate a unique message ID
   * @returns Unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
  
  /**
   * Generate a unique channel ID
   * @returns Unique channel ID
   */
  private generateChannelId(): string {
    return `channel_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}

// Types
interface MessageData {
  messageId: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  content: any;
  type: string;
  metadata: any;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface ChannelData {
  channelId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  type: 'topic' | 'broadcast' | 'direct';
  metadata: any;
  messages: ChannelMessageData[];
}

interface ChannelMessageData {
  messageId: string;
  channelId: string;
  senderId: string;
  timestamp: string;
  content: any;
  type: string;
  metadata: any;
}

// DTOs
export class SendDirectMessageDto {
  senderId: string;
  recipientId: string;
  content: any;
  type?: string;
  metadata?: any;
}

export class MessageInfoDto {
  messageId: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  type: string;
  status: string;
}

export class GetMessagesDto {
  agentId: string;
  since?: string;
  type?: string;
}

export class MessagesDto {
  agentId: string;
  messages: Array<{
    messageId: string;
    senderId: string;
    recipientId: string;
    timestamp: string;
    content: any;
    type: string;
    metadata: any;
    status: string;
  }>;
}

export class CreateChannelDto {
  name: string;
  description: string;
  createdBy: string;
  type?: 'topic' | 'broadcast' | 'direct';
  metadata?: any;
}

export class ChannelInfoDto {
  channelId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  type: string;
  subscriberCount: number;
}

export class SubscribeToChannelDto {
  channelId: string;
  agentId: string;
}

export class SubscriptionInfoDto {
  channelId: string;
  agentId: string;
  subscribedAt: string;
  channelName: string;
  channelType: string;
}

export class UnsubscribeFromChannelDto {
  channelId: string;
  agentId: string;
}

export class UnsubscriptionInfoDto {
  channelId: string;
  agentId: string;
  unsubscribedAt: string;
  channelName: string;
}

export class SendChannelMessageDto {
  channelId: string;
  senderId: string;
  content: any;
  type?: string;
  metadata?: any;
}

export class ChannelMessageInfoDto {
  messageId: string;
  channelId: string;
  senderId: string;
  timestamp: string;
  type: string;
  recipientCount: number;
}

export class GetChannelMessagesDto {
  channelId: string;
  agentId: string;
  since?: string;
  type?: string;
}

export class ChannelMessagesDto {
  channelId: string;
  agentId: string;
  channelName: string;
  messages: Array<{
    messageId: string;
    senderId: string;
    timestamp: string;
    content: any;
    type: string;
    metadata: any;
  }>;
}

export class BroadcastMessageDto {
  poolId: string;
  senderId: string;
  content: any;
  type?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: any;
}

export class BroadcastInfoDto {
  messageId: string;
  poolId: string;
  senderId: string;
  timestamp: string;
  type: string;
  priority: string;
}
