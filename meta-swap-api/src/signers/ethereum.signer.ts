import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { logger } from '../logger.instance';

@Injectable()
export class EthereumSigner {
  private readonly provider: ethers.providers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  
  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('ETH_RPC_URL');
    const privateKey = this.configService.get<string>('ETH_PRIVATE_KEY');
    
    if (!rpcUrl) {
      throw new Error('ETH_RPC_URL is not defined in environment variables');
    }
    
    if (!privateKey) {
      throw new Error('ETH_PRIVATE_KEY is not defined in environment variables');
    }
    
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }
  
  /**
   * Gets the signer's address
   * @returns The Ethereum address
   */
  getAddress(): string {
    return this.wallet.address;
  }
  
  /**
   * Sends a transaction
   * @param transaction The transaction parameters
   * @returns The transaction hash
   */
  async sendTransaction(transaction: any): Promise<string> {
    try {
      const tx = await this.wallet.sendTransaction({
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0',
        gasLimit: transaction.gasLimit,
      });
      
      logger.info(`Transaction sent: ${tx.hash}`, 'EthereumSigner');
      
      const receipt = await tx.wait();
      logger.info(`Transaction confirmed: ${receipt.transactionHash}`, 'EthereumSigner');
      
      return receipt.transactionHash;
    } catch (error) {
      logger.error(`Error sending transaction: ${error.message}`, error.stack, 'EthereumSigner');
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }
  
  /**
   * Signs a message
   * @param message The message to sign
   * @returns The signature
   */
  async signMessage(message: string): Promise<string> {
    try {
      return await this.wallet.signMessage(message);
    } catch (error) {
      logger.error(`Error signing message: ${error.message}`, error.stack, 'EthereumSigner');
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }
}
