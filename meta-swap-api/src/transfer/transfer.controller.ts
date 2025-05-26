import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { TransferDto, TransferResponse } from './transfer.dto';

@ApiTags('transfer')
@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @ApiOperation({ summary: 'Execute a token transfer' })
  @ApiBody({ type: TransferDto })
  @ApiResponse({ status: 200, description: 'Transfer executed successfully', type: TransferResponse })
  async executeTransfer(@Body() transferDto: TransferDto): Promise<TransferResponse> {
    return this.transferService.executeTransfer(transferDto);
  }
}
