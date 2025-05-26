import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { logger } from '../logger.instance';

@Injectable()
export class OpenFinanceProvider {
  private readonly apiUrl = 'https://api.openfinance.io/v1';
  
  constructor(private configService: ConfigService) {}
  
  /**
   * Gets the provider name
   * @returns The provider name
   */
  getName(): string {
    return 'openfinance';
  }
  
  /**
   * Gets a quote for a token swap
   * @param params The quote parameters
   * @returns The quote result
   */
  async getQuote(params: any): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('OPENFINANCE_API_KEY');
      
      const response = await axios.get(`${this.apiUrl}/price`, {
        params: {
          baseToken: params.fromToken,
          quoteToken: params.toToken,
          amount: params.amount,
        },
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });
      
      return {
        rate: response.data.price,
        estimatedGas: response.data.estimatedGas,
        estimatedFee: '0.0045', // Simplified for example
      };
    } catch (error) {
      logger.error(`Error getting quote from OpenFinance: ${error.message}`, error.stack, 'OpenFinanceProvider');
      throw new Error(`Failed to get quote from OpenFinance: ${error.message}`);
    }
  }
  
  /**
   * Executes a token swap
   * @param params The swap parameters
   * @returns The swap result
   */
  async executeSwap(params: any): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('OPENFINANCE_API_KEY');
      
      // Get swap data
      const swapResponse = await axios.post(`${this.apiUrl}/trade`, {
        baseToken: params.fromToken,
        quoteToken: params.toToken,
        amount: params.amount,
        slippage: params.slippage,
        walletAddress: params.signer.getAddress(),
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
        toAmount: swapResponse.data.expectedOutput,
        executionPrice: swapResponse.data.executionPrice,
      };
    } catch (error) {
      logger.error(`Error executing swap with OpenFinance: ${error.message}`, error.stack, 'OpenFinanceProvider');
      throw new Error(`Failed to execute swap with OpenFinance: ${error.message}`);
    }
  }
}
