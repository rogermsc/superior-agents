import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new agent and generate credentials
   * @param agentData Agent registration data
   * @returns Agent credentials including token
   */
  async registerAgent(agentData: AgentRegistrationDto): Promise<AgentCredentialsDto> {
    // Generate a unique agent ID
    const agentId = uuidv4();
    
    // Create agent payload
    const payload = {
      sub: agentId,
      name: agentData.name,
      type: agentData.type,
      version: agentData.version,
      capabilities: agentData.capabilities || [],
      createdAt: new Date().toISOString(),
    };
    
    // Generate JWT token
    const token = this.jwtService.sign(payload);
    
    // In a real implementation, we would store agent data in a database
    // For now, we'll just return the credentials
    
    return {
      agentId,
      token,
      expiresIn: '30d',
    };
  }

  /**
   * Validate an agent token
   * @param token JWT token
   * @returns Decoded agent data if valid
   */
  async validateAgent(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get agent data from token
   * @param token JWT token
   * @returns Decoded agent data
   */
  async getAgentData(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }

  /**
   * Refresh an agent token
   * @param token Current JWT token
   * @returns New agent credentials
   */
  async refreshToken(token: string): Promise<AgentCredentialsDto | null> {
    try {
      const decoded = await this.validateAgent(token);
      if (!decoded) {
        return null;
      }
      
      // Create new payload based on existing data
      const payload = {
        sub: decoded.sub,
        name: decoded.name,
        type: decoded.type,
        version: decoded.version,
        capabilities: decoded.capabilities,
        createdAt: decoded.createdAt,
        refreshedAt: new Date().toISOString(),
      };
      
      // Generate new JWT token
      const newToken = this.jwtService.sign(payload);
      
      return {
        agentId: decoded.sub,
        token: newToken,
        expiresIn: '30d',
      };
    } catch (error) {
      return null;
    }
  }
}

// DTOs
export class AgentRegistrationDto {
  name: string;
  type: string;
  version: string;
  capabilities?: string[];
}

export class AgentCredentialsDto {
  agentId: string;
  token: string;
  expiresIn: string;
}
