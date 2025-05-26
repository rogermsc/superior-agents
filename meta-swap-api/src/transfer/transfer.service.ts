import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { TransferDto, TransferResponse } from './transfer.dto';
import { EthereumSigner } from '../signers/ethereum.signer';
import { SolanaSigner } from '../signers/solana.signer';
import { logger } from '../logger.instance';

@Injectable()
export class TransferService {
  private readonly signers = {
    eth: this.ethereumSigner,
    solana: this.solanaSigner,
  };

  constructor(
    private configService: ConfigService,
    private ethereumSigner: EthereumSigner,
    private solanaSigner: SolanaSigner,
  ) {}

  /**
   * Executes a token transfer
   * @param transferDto The transfer parameters
   * @returns The transfer result
   */
  async executeTransfer(transferDto: TransferDto): Promise<TransferResponse> {
    logger.info(`Executing transfer: ${JSON.stringify(transferDto)}`, 'TransferService');
    
    // Get signer
    const signer = this.getSigner(transferDto.chain);
    
    // Execute transfer based on chain
    let txHash: string;
    if (transferDto.chain === 'eth') {
      txHash = await this.executeEthereumTransfer(transferDto, signer);
    } else if (transferDto.chain === 'solana') {
      txHash = await this.executeSolanaTransfer(transferDto, signer);
    } else {
      throw new Error(`Unsupported chain: ${transferDto.chain}`);
    }
    
    return {
      txHash,
      token: transferDto.token,
      recipient: transferDto.recipient,
      amount: transferDto.amount,
      chain: transferDto.chain,
    };
  }

  /**
   * Executes an Ethereum token transfer
   * @param transferDto The transfer parameters
   * @param signer The Ethereum signer
   * @returns The transaction hash
   */
  private async executeEthereumTransfer(transferDto: TransferDto, signer: any): Promise<string> {
    try {
      // Check if it's ETH (native token) or ERC20
      if (transferDto.token.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        // Native ETH transfer
        return await signer.sendTransaction({
          to: transferDto.recipient,
          value: transferDto.amount,
          gasLimit: 21000,
        });
      } else {
        // ERC20 transfer
        const erc20Abi = [
          'function transfer(address to, uint256 amount) returns (bool)',
        ];
        const provider = new ethers.providers.JsonRpcProvider(this.configService.get<string>('ETH_RPC_URL'));
        const contract = new ethers.Contract(transferDto.token, erc20Abi, provider);
        
        const data = contract.interface.encodeFunctionData('transfer', [
          transferDto.recipient,
          transferDto.amount,
        ]);
        
        return await signer.sendTransaction({
          to: transferDto.token,
          data,
          gasLimit: 100000,
        });
      }
    } catch (error) {
      logger.error(`Error executing Ethereum transfer: ${error.message}`, error.stack, 'TransferService');
      throw new Error(`Failed to execute Ethereum transfer: ${error.message}`);
    }
  }

  /**
   * Executes a Solana token transfer
   * @param transferDto The transfer parameters
   * @param signer The Solana signer
   * @returns The transaction signature
   */
  private async executeSolanaTransfer(transferDto: TransferDto, signer: any): Promise<string> {
    try {
      // In a real implementation, this would use the Solana web3.js library
      // to create and send a token transfer transaction
      // This is a simplified example
      const transaction = `{
        "version": "legacy",
        "feePayer": "${signer.getPublicKey()}",
        "instructions": [
          {
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "data": "${transferDto.amount}",
            "accounts": [
              {"pubkey": "${transferDto.token}", "isSigner": false, "isWritable": true},
              {"pubkey": "${transferDto.recipient}", "isSigner": false, "isWritable": true},
              {"pubkey": "${signer.getPublicKey()}", "isSigner": true, "isWritable": false}
            ]
          }
        ]
      }`;
      
      return await signer.sendTransaction(Buffer.from(transaction).toString('base64'));
    } catch (error) {
      logger.error(`Error executing Solana transfer: ${error.message}`, error.stack, 'TransferService');
      throw new Error(`Failed to execute Solana transfer: ${error.message}`);
    }
  }

  /**
   * Gets a signer for a specific chain
   * @param chain The blockchain network
   * @returns The signer
   */
  private getSigner(chain: string): any {
    const signer = this.signers[chain];
    if (!signer) {
      throw new Error(`No signer available for chain ${chain}`);
    }
    return signer;
  }
}
