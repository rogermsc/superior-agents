import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { logger } from '../logger.instance';

@Injectable()
export class KyberProvider {
  private readonly apiUrl = 'https://api.kyberswap.com/v1';
  
  constructor(private configService: ConfigService) {}
  
  /**
   * Gets the provider name
   * @returns The provider name
   */
  getName(): string {
    return 'kyber';
  }
  
  /**
   * Gets a quote for a token swap
   * @param params The quote parameters
   * @returns The quote result
   */
  async getQuote(params: any): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('KYBER_API_KEY');
      
      const response = await axios.get(`${this.apiUrl}/quote`, {
        params: {
          tokenIn: params.fromToken,
          tokenOut: params.toToken,
          amountIn: params.amount,
        },
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json',
        },
      });
      
      return {
        rate: response.data.outputAmount / params.amount,
        estimatedGas: response.data.gasEstimate,
        estimatedFee: '0.006', // Simplified for example
      };
    } catch (error) {
      logger.error(`Error getting quote from Kyber: ${error.message}`, error.stack, 'KyberProvider');
      throw new Error(`Failed to get quote from Kyber: ${error.message}`);
    }
  }
  
  /**
   * Executes a token swap
   * @param params The swap parameters
   * @returns The swap result
   */
  async executeSwap(params: any): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('KYBER_API_KEY');
      
      // Get swap data
      const swapResponse = await axios.post(`${this.apiUrl}/swap`, {
        tokenIn: params.fromToken,
        tokenOut: params.toToken,
        amountIn: params.amount,
        slippageTolerance: params.slippage,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
        recipient: params.signer.getAddress(),
      }, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Sign and send transaction
      const txHash = await params.signer.sendTransaction({
        to: swapResponse.data.to,
        data: swapResponse.data.data,
        value: swapResponse.data.value,
        gasLimit: swapResponse.data.gasLimit,
      });
      
      return {
        txHash,
        fromAmount: params.amount,
        toAmount: swapResponse.data.outputAmount,
        executionPrice: swapResponse.data.outputAmount / params.amount,
      };
    } catch (error) {
      logger.error(`Error executing swap with Kyber: ${error.message}`, error.stack, 'KyberProvider');
      throw new Error(`Failed to execute swap with Kyber: ${error.message}`);
    }
  }
}
