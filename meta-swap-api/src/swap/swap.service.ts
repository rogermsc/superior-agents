import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwapDto, QuoteDto, SwapResponse, QuoteResponse, ProviderQuote } from './swap.dto';
import { OneInchProvider } from '../swap-providers/oneinch.provider';
import { KyberProvider } from '../swap-providers/kyber.provider';
import { OpenFinanceProvider } from '../swap-providers/openfinance.provider';
import { OkxProvider } from '../swap-providers/okx.provider';
import { RaydiumProvider } from '../swap-providers/raydium.provider';
import { EthereumSigner } from '../signers/ethereum.signer';
import { SolanaSigner } from '../signers/solana.signer';
import { AddressesService } from '../addresses/addresses.service';
import { logger } from '../logger.instance';

@Injectable()
export class SwapService {
  private readonly providers = {
    eth: {
      '1inch': this.oneInchProvider,
      'kyber': this.kyberProvider,
      'openfinance': this.openFinanceProvider,
    },
    solana: {
      'okx': this.okxProvider,
      'raydium': this.raydiumProvider,
    },
  };

  private readonly signers = {
    eth: this.ethereumSigner,
    solana: this.solanaSigner,
  };

  constructor(
    private configService: ConfigService,
    private oneInchProvider: OneInchProvider,
    private kyberProvider: KyberProvider,
    private openFinanceProvider: OpenFinanceProvider,
    private okxProvider: OkxProvider,
    private raydiumProvider: RaydiumProvider,
    private ethereumSigner: EthereumSigner,
    private solanaSigner: SolanaSigner,
    private addressesService: AddressesService,
  ) {}

  /**
   * Executes a token swap
   * @param swapDto The swap parameters
   * @returns The swap result
   */
  async executeSwap(swapDto: SwapDto): Promise<SwapResponse> {
    logger.info(`Executing swap: ${JSON.stringify(swapDto)}`, 'SwapService');
    
    // Validate addresses
    this.validateAddresses(swapDto.chain, swapDto.fromToken, swapDto.toToken);
    
    // Get provider
    const provider = this.getProvider(swapDto.chain, swapDto.provider);
    
    // Get signer
    const signer = this.getSigner(swapDto.chain);
    
    // Execute swap
    const swapResult = await provider.executeSwap({
      fromToken: swapDto.fromToken,
      toToken: swapDto.toToken,
      amount: swapDto.amount,
      slippage: swapDto.slippage,
      signer,
    });
    
    return {
      txHash: swapResult.txHash,
      fromAmount: swapResult.fromAmount,
      toAmount: swapResult.toAmount,
      executionPrice: swapResult.executionPrice,
      provider: provider.getName(),
    };
  }

  /**
   * Gets quotes from all available providers
   * @param quoteDto The quote parameters
   * @returns Quotes from all providers and the best one
   */
  async getQuotes(quoteDto: QuoteDto): Promise<QuoteResponse> {
    logger.info(`Getting quotes: ${JSON.stringify(quoteDto)}`, 'SwapService');
    
    // Validate addresses
    this.validateAddresses(quoteDto.chain, quoteDto.fromToken, quoteDto.toToken);
    
    // Get all providers for the chain
    const chainProviders = this.providers[quoteDto.chain];
    if (!chainProviders) {
      throw new Error(`No providers available for chain ${quoteDto.chain}`);
    }
    
    // Get quotes from all providers
    const providerQuotes: ProviderQuote[] = [];
    for (const [name, provider] of Object.entries(chainProviders)) {
      try {
        const quote = await provider.getQuote({
          fromToken: quoteDto.fromToken,
          toToken: quoteDto.toToken,
          amount: quoteDto.amount,
        });
        
        providerQuotes.push({
          name,
          rate: quote.rate,
          estimatedGas: quote.estimatedGas,
          estimatedFee: quote.estimatedFee,
        });
      } catch (error) {
        logger.error(`Error getting quote from ${name}: ${error.message}`, error.stack, 'SwapService');
      }
    }
    
    // Find the best provider based on rate and fees
    const bestProvider = this.findBestProvider(providerQuotes);
    
    return {
      providers: providerQuotes,
      bestProvider,
    };
  }

  /**
   * Validates token addresses for a specific chain
   * @param chain The blockchain network
   * @param fromToken The source token address
   * @param toToken The destination token address
   */
  private validateAddresses(chain: string, fromToken: string, toToken: string): void {
    if (!this.addressesService.isValidAddress(chain, fromToken)) {
      throw new Error(`Invalid fromToken address for chain ${chain}: ${fromToken}`);
    }
    
    if (!this.addressesService.isValidAddress(chain, toToken)) {
      throw new Error(`Invalid toToken address for chain ${chain}: ${toToken}`);
    }
  }

  /**
   * Gets a provider for a specific chain
   * @param chain The blockchain network
   * @param providerName The provider name (optional)
   * @returns The provider
   */
  private getProvider(chain: string, providerName?: string): any {
    const chainProviders = this.providers[chain];
    if (!chainProviders) {
      throw new Error(`No providers available for chain ${chain}`);
    }
    
    if (providerName) {
      const provider = chainProviders[providerName];
      if (!provider) {
        throw new Error(`Provider ${providerName} not available for chain ${chain}`);
      }
      return provider;
    }
    
    // Return the first provider if none specified
    return Object.values(chainProviders)[0];
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

  /**
   * Finds the best provider based on rate and fees
   * @param providers The provider quotes
   * @returns The name of the best provider
   */
  private findBestProvider(providers: ProviderQuote[]): string {
    if (providers.length === 0) {
      throw new Error('No provider quotes available');
    }
    
    if (providers.length === 1) {
      return providers[0].name;
    }
    
    // Simple algorithm: choose the provider with the best rate
    // In a real implementation, you would consider fees as well
    let bestProvider = providers[0];
    for (const provider of providers.slice(1)) {
      if (parseFloat(provider.rate) > parseFloat(bestProvider.rate)) {
        bestProvider = provider;
      }
    }
    
    return bestProvider.name;
  }
}
