import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { logger } from '../logger.instance';

@Injectable()
export class OneInchProvider {
  private readonly apiUrl = 'https://api.1inch.io/v5.0/1';
  
  constructor(private configService: ConfigService) {}
  
  /**
   * Gets the provider name
   * @returns The provider name
   */
  getName(): string {
    return '1inch';
  }
  
  /**
   * Gets a quote for a token swap
   * @param params The quote parameters
   * @returns The quote result
   */
  async getQuote(params: any): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('ONEINCH_API_KEY');
      
      const response = await axios.get(`${this.apiUrl}/quote`, {
        params: {
          fromTokenAddress: params.fromToken,
          toTokenAddress: params.toToken,
          amount: params.amount,
        },
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });
      
      return {
        rate: response.data.toTokenAmount / response.data.fromTokenAmount,
        estimatedGas: response.data.estimatedGas,
        estimatedFee: '0.005', // Simplified for example
      };
    } catch (error) {
      logger.error(`Error getting quote from 1inch: ${error.message}`, error.stack, 'OneInchProvider');
      throw new Error(`Failed to get quote from 1inch: ${error.message}`);
    }
  }
  
  /**
   * Executes a token swap
   * @param params The swap parameters
   * @returns The swap result
   */
  async executeSwap(params: any): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('ONEINCH_API_KEY');
      
      // Get swap data
      const swapResponse = await axios.get(`${this.apiUrl}/swap`, {
        params: {
          fromTokenAddress: params.fromToken,
          toTokenAddress: params.toToken,
          amount: params.amount,
          fromAddress: params.signer.getAddress(),
          slippage: params.slippage,
        },
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });
      
      // Sign and send transaction
      const txHash = await params.signer.sendTransaction({
        to: swapResponse.data.tx.to,
        data: swapResponse.data.tx.data,
        value: swapResponse.data.tx.value,
        gasLimit: swapResponse.data.tx.gas,
      });
      
      return {
        txHash,
        fromAmount: params.amount,
        toAmount: swapResponse.data.toTokenAmount,
        executionPrice: swapResponse.data.toTokenAmount / params.amount,
      };
    } catch (error) {
      logger.error(`Error executing swap with 1inch: ${error.message}`, error.stack, 'OneInchProvider');
      throw new Error(`Failed to execute swap with 1inch: ${error.message}`);
    }
  }
}
