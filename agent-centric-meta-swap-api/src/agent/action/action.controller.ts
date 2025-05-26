import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActionService, SwapActionDto, TransferActionDto, ActionResultDto } from './action.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';

@ApiTags('agent-action')
@Controller('agent/action')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post('swap')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a token swap action' })
  @ApiResponse({ status: 200, description: 'Swap action processed successfully', type: ActionResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid action parameters' })
  async executeSwapAction(@Body() actionParams: SwapActionDto): Promise<ActionResultDto> {
    return this.actionService.processSwapAction(actionParams);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a token transfer action' })
  @ApiResponse({ status: 200, description: 'Transfer action processed successfully', type: ActionResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid action parameters' })
  async executeTransferAction(@Body() actionParams: TransferActionDto): Promise<ActionResultDto> {
    return this.actionService.processTransferAction(actionParams);
  }
}
