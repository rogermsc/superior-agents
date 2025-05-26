import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  SharedMemoryService, 
  CreateMemorySpaceDto,
  MemorySpaceInfoDto,
  GetMemorySpaceDetailsDto,
  MemorySpaceDetailsDto,
  AddKnowledgeEntryDto,
  KnowledgeEntryInfoDto,
  UpdateKnowledgeEntryDto,
  GetKnowledgeEntryDto,
  KnowledgeEntryDto,
  QueryKnowledgeEntriesDto,
  KnowledgeEntriesDto,
  UpdateAccessControlDto,
  AccessControlInfoDto
} from './shared-memory.service';
import { AgentAuthGuard } from '../../agent/auth/agent-auth.guard';

@ApiTags('multi-agent-shared-memory')
@Controller('multi-agent/shared-memory')
@UseGuards(AgentAuthGuard)
@ApiBearerAuth()
export class SharedMemoryController {
  constructor(private readonly sharedMemoryService: SharedMemoryService) {}

  @Post('spaces')
  @ApiOperation({ summary: 'Create a new memory space' })
  @ApiResponse({ status: 201, description: 'Memory space created successfully', type: MemorySpaceInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createMemorySpace(@Body() params: CreateMemorySpaceDto): Promise<MemorySpaceInfoDto> {
    return this.sharedMemoryService.createMemorySpace(params);
  }

  @Get('spaces/:spaceId')
  @ApiOperation({ summary: 'Get memory space details' })
  @ApiResponse({ status: 200, description: 'Memory space details retrieved successfully', type: MemorySpaceDetailsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memory space not found' })
  async getMemorySpaceDetails(
    @Param('spaceId') spaceId: string,
    @Query('agentId') agentId: string
  ): Promise<MemorySpaceDetailsDto> {
    return this.sharedMemoryService.getMemorySpaceDetails({ spaceId, agentId });
  }

  @Post('entries')
  @ApiOperation({ summary: 'Add knowledge entry to memory space' })
  @ApiResponse({ status: 201, description: 'Knowledge entry created successfully', type: KnowledgeEntryInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memory space not found' })
  async addKnowledgeEntry(@Body() params: AddKnowledgeEntryDto): Promise<KnowledgeEntryInfoDto> {
    return this.sharedMemoryService.addKnowledgeEntry(params);
  }

  @Post('entries/:entryId')
  @ApiOperation({ summary: 'Update knowledge entry' })
  @ApiResponse({ status: 200, description: 'Knowledge entry updated successfully', type: KnowledgeEntryInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Knowledge entry not found' })
  async updateKnowledgeEntry(
    @Param('entryId') entryId: string,
    @Body() params: Omit<UpdateKnowledgeEntryDto, 'entryId'>
  ): Promise<KnowledgeEntryInfoDto> {
    return this.sharedMemoryService.updateKnowledgeEntry({ ...params, entryId });
  }

  @Get('entries/:entryId')
  @ApiOperation({ summary: 'Get knowledge entry' })
  @ApiResponse({ status: 200, description: 'Knowledge entry retrieved successfully', type: KnowledgeEntryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Knowledge entry not found' })
  async getKnowledgeEntry(
    @Param('entryId') entryId: string,
    @Query('agentId') agentId: string
  ): Promise<KnowledgeEntryDto> {
    return this.sharedMemoryService.getKnowledgeEntry({ entryId, agentId });
  }

  @Get('spaces/:spaceId/entries')
  @ApiOperation({ summary: 'Query knowledge entries' })
  @ApiResponse({ status: 200, description: 'Knowledge entries retrieved successfully', type: KnowledgeEntriesDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memory space not found' })
  async queryKnowledgeEntries(
    @Param('spaceId') spaceId: string,
    @Query() params: Omit<QueryKnowledgeEntriesDto, 'spaceId'>
  ): Promise<KnowledgeEntriesDto> {
    return this.sharedMemoryService.queryKnowledgeEntries({ ...params, spaceId });
  }

  @Post('spaces/:spaceId/access')
  @ApiOperation({ summary: 'Update memory space access control' })
  @ApiResponse({ status: 200, description: 'Access control updated successfully', type: AccessControlInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memory space not found' })
  async updateAccessControl(
    @Param('spaceId') spaceId: string,
    @Body() params: Omit<UpdateAccessControlDto, 'spaceId'>
  ): Promise<AccessControlInfoDto> {
    return this.sharedMemoryService.updateAccessControl({ ...params, spaceId });
  }
}
