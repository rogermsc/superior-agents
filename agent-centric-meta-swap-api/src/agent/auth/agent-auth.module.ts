import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentAuthService } from './agent-auth.service';
import { AgentAuthController } from './agent-auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('AGENT_JWT_SECRET') || 'agent_secret_key',
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AgentAuthController],
  providers: [AgentAuthService],
  exports: [AgentAuthService],
})
export class AgentAuthModule {}
