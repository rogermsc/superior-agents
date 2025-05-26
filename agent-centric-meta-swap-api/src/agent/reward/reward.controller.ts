import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RewardService, ActionRewardParamsDto, RewardResultDto } from './reward.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';

@ApiTags('agent-reward')
@Controller('agent/reward')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate reward for a completed action' })
  @ApiResponse({ status: 200, description: 'Reward calculated successfully', type: RewardResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async calculateActionReward(@Body() rewardParams: ActionRewardParamsDto): Promise<RewardResultDto> {
    return this.rewardService.calculateActionReward(rewardParams);
  }
}
