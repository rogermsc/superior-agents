import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  CommunicationService, 
  SendDirectMessageDto,
  MessageInfoDto,
  GetMessagesDto,
  MessagesDto,
  CreateChannelDto,
  ChannelInfoDto,
  SubscribeToChannelDto,
  SubscriptionInfoDto,
  UnsubscribeFromChannelDto,
  UnsubscriptionInfoDto,
  SendChannelMessageDto,
  ChannelMessageInfoDto,
  GetChannelMessagesDto,
  ChannelMessagesDto,
  BroadcastMessageDto,
  BroadcastInfoDto
} from './communication.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('multi-agent-communication')
@Controller('multi-agent/communication')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('messages/direct')
  @ApiOperation({ summary: 'Send a direct message to another agent' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: MessageInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendDirectMessage(@Body() params: SendDirectMessageDto): Promise<MessageInfoDto> {
    return this.communicationService.sendDirectMessage(params);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages for an agent' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully', type: MessagesDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMessages(@Query() params: GetMessagesDto): Promise<MessagesDto> {
    return this.communicationService.getMessages(params);
  }

  @Post('channels')
  @ApiOperation({ summary: 'Create a communication channel' })
  @ApiResponse({ status: 201, description: 'Channel created successfully', type: ChannelInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createChannel(@Body() params: CreateChannelDto): Promise<ChannelInfoDto> {
    return this.communicationService.createChannel(params);
  }

  @Post('channels/subscribe')
  @ApiOperation({ summary: 'Subscribe to a channel' })
  @ApiResponse({ status: 200, description: 'Subscribed to channel successfully', type: SubscriptionInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async subscribeToChannel(@Body() params: SubscribeToChannelDto): Promise<SubscriptionInfoDto> {
    return this.communicationService.subscribeToChannel(params);
  }

  @Post('channels/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from a channel' })
  @ApiResponse({ status: 200, description: 'Unsubscribed from channel successfully', type: UnsubscriptionInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async unsubscribeFromChannel(@Body() params: UnsubscribeFromChannelDto): Promise<UnsubscriptionInfoDto> {
    return this.communicationService.unsubscribeFromChannel(params);
  }

  @Post('channels/messages')
  @ApiOperation({ summary: 'Send a message to a channel' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: ChannelMessageInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async sendChannelMessage(@Body() params: SendChannelMessageDto): Promise<ChannelMessageInfoDto> {
    return this.communicationService.sendChannelMessage(params);
  }

  @Get('channels/messages')
  @ApiOperation({ summary: 'Get channel messages' })
  @ApiResponse({ status: 200, description: 'Channel messages retrieved successfully', type: ChannelMessagesDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async getChannelMessages(@Query() params: GetChannelMessagesDto): Promise<ChannelMessagesDto> {
    return this.communicationService.getChannelMessages(params);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast a message to all agents in a pool' })
  @ApiResponse({ status: 201, description: 'Message broadcasted successfully', type: BroadcastInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async broadcastMessage(@Body() params: BroadcastMessageDto): Promise<BroadcastInfoDto> {
    return this.communicationService.broadcastMessage(params);
  }
}
