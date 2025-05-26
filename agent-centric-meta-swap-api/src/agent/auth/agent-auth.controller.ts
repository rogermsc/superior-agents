import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgentAuthService, AgentRegistrationDto, AgentCredentialsDto } from './agent-auth.service';
import { AgentAuthGuard } from './agent-auth.guard';

@ApiTags('agent-auth')
@Controller('agent/auth')
export class AgentAuthController {
  constructor(private readonly agentAuthService: AgentAuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new agent' })
  @ApiResponse({ status: 201, description: 'Agent registered successfully', type: AgentCredentialsDto })
  async registerAgent(@Body() agentData: AgentRegistrationDto): Promise<AgentCredentialsDto> {
    return this.agentAuthService.registerAgent(agentData);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh agent token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AgentCredentialsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(@Request() req): Promise<AgentCredentialsDto> {
    const token = req.headers.authorization.split(' ')[1];
    const result = await this.agentAuthService.refreshToken(token);
    if (!result) {
      throw new UnauthorizedException('Invalid token');
    }
    return result;
  }

  @Get('profile')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get agent profile' })
  @ApiResponse({ status: 200, description: 'Agent profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return req.agent;
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(private agentAuthService: AgentAuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: any): Promise<boolean> {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization type');
    }

    const agent = await this.agentAuthService.validateAgent(token);
    if (!agent) {
      throw new UnauthorizedException('Invalid token');
    }

    // Attach agent data to request
    request.agent = agent;
    return true;
  }
}
