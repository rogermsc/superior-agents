import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { logger } from '../logger.instance';

@Injectable()
export class AddressesService {
  private readonly commonTokens: Record<string, Record<string, string>> = {
    eth: {
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    },
    solana: {
      WSOL: 'So11111111111111111111111111111111111111112',
      USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    },
  };

  constructor(private configService: ConfigService) {}

  /**
   * Gets the address for a common token on a specific chain
   * @param chain The blockchain network
   * @param symbol The token symbol
   * @returns The token address
   */
  getCommonTokenAddress(chain: string, symbol: string): string {
    if (!this.commonTokens[chain]) {
      throw new Error(`Chain ${chain} not supported`);
    }

    const address = this.commonTokens[chain][symbol.toUpperCase()];
    if (!address) {
      throw new Error(`Token ${symbol} not found on chain ${chain}`);
    }

    return address;
  }

  /**
   * Validates if an address is valid for a specific chain
   * @param chain The blockchain network
   * @param address The address to validate
   * @returns True if the address is valid, false otherwise
   */
  isValidAddress(chain: string, address: string): boolean {
    try {
      if (chain === 'eth') {
        return ethers.utils.isAddress(address);
      } else if (chain === 'solana') {
        // Basic Solana address validation (44 characters)
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      }
      return false;
    } catch (error) {
      logger.error(`Error validating address: ${error.message}`, error.stack, 'AddressesService');
      return false;
    }
  }

  /**
   * Gets all common tokens for a specific chain
   * @param chain The blockchain network
   * @returns An object with token symbols as keys and addresses as values
   */
  getAllCommonTokens(chain: string): Record<string, string> {
    if (!this.commonTokens[chain]) {
      throw new Error(`Chain ${chain} not supported`);
    }
    return this.commonTokens[chain];
  }

  /**
   * Gets the native wrapped token for a specific chain
   * @param chain The blockchain network
   * @returns The wrapped token address
   */
  getNativeWrappedToken(chain: string): string {
    if (chain === 'eth') {
      return this.commonTokens.eth.WETH;
    } else if (chain === 'solana') {
      return this.commonTokens.solana.WSOL;
    }
    throw new Error(`Chain ${chain} not supported`);
  }
}
