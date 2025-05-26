import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { logger } from '../logger.instance';

@Injectable()
export class RaydiumProvider {
  private readonly apiUrl = 'https://api.raydium.io/v2';
  
  constructor(private configService: ConfigService) {}
  
  /**
   * Gets the provider name
   * @returns The provider name
   */
  getName(): string {
    return 'raydium';
  }
  
  /**
   * Gets a quote for a token swap
   * @param params The quote parameters
   * @returns The quote result
   */
  async getQuote(params: any): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/main/price`, {
        params: {
          inputMint: params.fromToken,
          outputMint: params.toToken,
          amount: params.amount,
          slippage: 0.5,
        },
        headers: {
          'Accept': 'application/json',
        },
      });
      
      return {
        rate: response.data.outAmount / params.amount,
        estimatedGas: '0', // Solana doesn't use gas in the same way
        estimatedFee: response.data.fee,
      };
    } catch (error) {
      logger.error(`Error getting quote from Raydium: ${error.message}`, error.stack, 'RaydiumProvider');
      throw new Error(`Failed to get quote from Raydium: ${error.message}`);
    }
  }
  
  /**
   * Executes a token swap
   * @param params The swap parameters
   * @returns The swap result
   */
  async executeSwap(params: any): Promise<any> {
    try {
      // Get swap transaction
      const swapResponse = await axios.post(`${this.apiUrl}/main/swap`, {
        inputMint: params.fromToken,
        outputMint: params.toToken,
        amount: params.amount,
        slippage: params.slippage,
        wallet: params.signer.getPublicKey(),
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Execute the swap using the Solana signer
      const txHash = await params.signer.sendTransaction(swapResponse.data.transaction);
      
      return {
        txHash,
        fromAmount: params.amount,
        toAmount: swapResponse.data.outAmount,
        executionPrice: swapResponse.data.outAmount / params.amount,
      };
    } catch (error) {
      logger.error(`Error executing swap with Raydium: ${error.message}`, error.stack, 'RaydiumProvider');
      throw new Error(`Failed to execute swap with Raydium: ${error.message}`);
    }
  }
}
