import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RateLimitingService } from './rate-limiting.service';

@Injectable()
export class RateLimitingGuard implements CanActivate {
  constructor(private rateLimitingService: RateLimitingService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: any): Promise<boolean> {
    // Extract agent ID from request
    const agentId = request.agent?.sub;
    if (!agentId) {
      // If no agent ID, allow the request (auth guard should handle this)
      return true;
    }

    // Get the endpoint being accessed
    const endpoint = request.route.path;

    // Check rate limit
    const result = await this.rateLimitingService.checkRateLimit(agentId, endpoint);

    if (!result.isAllowed) {
      // Add rate limit headers to response
      const response = request.res;
      response.setHeader('X-RateLimit-Limit', this.getMaxRequests(endpoint, result.currentPhase));
      response.setHeader('X-RateLimit-Remaining', result.remainingRequests);
      response.setHeader('X-RateLimit-Reset', result.resetTime);
      response.setHeader('X-RateLimit-Phase', result.currentPhase);

      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Rate limit exceeded',
        rateLimitInfo: {
          remainingRequests: result.remainingRequests,
          resetTime: result.resetTime,
          currentPhase: result.currentPhase,
        },
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Add rate limit headers to successful response
    const response = request.res;
    response.setHeader('X-RateLimit-Limit', this.getMaxRequests(endpoint, result.currentPhase));
    response.setHeader('X-RateLimit-Remaining', result.remainingRequests);
    response.setHeader('X-RateLimit-Reset', result.resetTime);
    response.setHeader('X-RateLimit-Phase', result.currentPhase);

    return true;
  }

  private getMaxRequests(endpoint: string, learningPhase: string): number {
    // This should match the logic in RateLimitingService
    let baseLimit = 100; // Default
    
    if (endpoint.includes('observation')) {
      baseLimit = 200;
    } else if (endpoint.includes('action')) {
      baseLimit = 50;
    } else if (endpoint.includes('reward')) {
      baseLimit = 100;
    }
    
    const phaseMultipliers = {
      'exploration': 1.5,
      'exploitation': 1.0,
      'fine-tuning': 0.7,
    };
    
    return Math.floor(baseLimit * phaseMultipliers[learningPhase]);
  }
}
