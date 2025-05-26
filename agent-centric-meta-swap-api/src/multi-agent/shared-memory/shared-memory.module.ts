import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedMemoryService } from './shared-memory.service';
import { SharedMemoryController } from './shared-memory.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SharedMemoryController],
  providers: [SharedMemoryService],
  exports: [SharedMemoryService],
})
export class SharedMemoryModule {}
