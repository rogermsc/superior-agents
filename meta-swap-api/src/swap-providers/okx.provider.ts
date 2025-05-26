import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { logger } from '../logger.instance';

@Injectable()
export class OkxProvider {
  private readonly apiUrl = 'https://www.okx.com/api/v5/dex';
  
  constructor(private configService: ConfigService) {}
  
  /**
   * Gets the provider name
   * @returns The provider name
   */
  getName(): string {
    return 'okx';
  }
  
  /**
   * Gets a quote for a token swap
   * @param params The quote parameters
   * @returns The quote result
   */
  async getQuote(params: any): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/quote`, {
        params: {
          fromMint: params.fromToken,
          toMint: params.toToken,
          amount: params.amount,
          slippage: 0.5,
        },
        headers: {
          'Accept': 'application/json',
        },
      });
      
      return {
        rate: response.data.data.price,
        estimatedGas: '0', // Solana doesn't use gas in the same way
        estimatedFee: response.data.data.fee,
      };
    } catch (error) {
      logger.error(`Error getting quote from OKX: ${error.message}`, error.stack, 'OkxProvider');
      throw new Error(`Failed to get quote from OKX: ${error.message}`);
    }
  }
  
  /**
   * Executes a token swap
   * @param params The swap parameters
   * @returns The swap result
   */
  async executeSwap(params: any): Promise<any> {
    try {
      // Get swap route
      const routeResponse = await axios.get(`${this.apiUrl}/route`, {
        params: {
          fromMint: params.fromToken,
          toMint: params.toToken,
          amount: params.amount,
          slippage: params.slippage,
        },
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // Execute the swap using the Solana signer
      const txHash = await params.signer.sendTransaction(routeResponse.data.data.transaction);
      
      return {
        txHash,
        fromAmount: params.amount,
        toAmount: routeResponse.data.data.outAmount,
        executionPrice: routeResponse.data.data.outAmount / params.amount,
      };
    } catch (error) {
      logger.error(`Error executing swap with OKX: ${error.message}`, error.stack, 'OkxProvider');
      throw new Error(`Failed to execute swap with OKX: ${error.message}`);
    }
  }
}
