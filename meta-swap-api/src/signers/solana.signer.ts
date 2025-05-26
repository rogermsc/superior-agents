import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as web3 from '@solana/web3.js';
import { logger } from '../logger.instance';

@Injectable()
export class SolanaSigner {
  private readonly connection: web3.Connection;
  private readonly keypair: web3.Keypair;
  
  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    const privateKey = this.configService.get<string>('SOLANA_PRIVATE_KEY');
    
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC_URL is not defined in environment variables');
    }
    
    if (!privateKey) {
      throw new Error('SOLANA_PRIVATE_KEY is not defined in environment variables');
    }
    
    this.connection = new web3.Connection(rpcUrl);
    
    // Convert private key to Uint8Array
    const privateKeyBytes = Buffer.from(privateKey, 'hex');
    this.keypair = web3.Keypair.fromSecretKey(privateKeyBytes);
  }
  
  /**
   * Gets the signer's public key
   * @returns The Solana public key
   */
  getPublicKey(): string {
    return this.keypair.publicKey.toString();
  }
  
  /**
   * Sends a transaction
   * @param serializedTransaction The serialized transaction
   * @returns The transaction signature
   */
  async sendTransaction(serializedTransaction: string): Promise<string> {
    try {
      // Deserialize the transaction
      const transaction = web3.Transaction.from(Buffer.from(serializedTransaction, 'base64'));
      
      // Sign the transaction
      transaction.sign(this.keypair);
      
      // Send the transaction
      const signature = await web3.sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.keypair],
      );
      
      logger.info(`Transaction sent: ${signature}`, 'SolanaSigner');
      
      return signature;
    } catch (error) {
      logger.error(`Error sending transaction: ${error.message}`, error.stack, 'SolanaSigner');
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
      const messageBytes = Buffer.from(message);
      const signature = web3.nacl.sign.detached(messageBytes, this.keypair.secretKey);
      return Buffer.from(signature).toString('hex');
    } catch (error) {
      logger.error(`Error signing message: ${error.message}`, error.stack, 'SolanaSigner');
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }
}
