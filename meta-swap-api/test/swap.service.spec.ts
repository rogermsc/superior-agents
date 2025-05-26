import { Test, TestingModule } from '@nestjs/testing';
import { SwapService } from '../src/swap/swap.service';
import { SwapDto, QuoteDto } from '../src/swap/swap.dto';
import { OneInchProvider } from '../src/swap-providers/oneinch.provider';
import { KyberProvider } from '../src/swap-providers/kyber.provider';
import { OpenFinanceProvider } from '../src/swap-providers/openfinance.provider';
import { OkxProvider } from '../src/swap-providers/okx.provider';
import { RaydiumProvider } from '../src/swap-providers/raydium.provider';
import { EthereumSigner } from '../src/signers/ethereum.signer';
import { SolanaSigner } from '../src/signers/solana.signer';
import { AddressesService } from '../src/addresses/addresses.service';
import { ConfigService } from '@nestjs/config';

describe('SwapService', () => {
  let service: SwapService;
  let oneInchProvider: OneInchProvider;
  let addressesService: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapService,
        {
          provide: OneInchProvider,
          useValue: {
            getName: jest.fn().mockReturnValue('1inch'),
            getQuote: jest.fn(),
            executeSwap: jest.fn(),
          },
        },
        {
          provide: KyberProvider,
          useValue: {
            getName: jest.fn().mockReturnValue('kyber'),
            getQuote: jest.fn(),
            executeSwap: jest.fn(),
          },
        },
        {
          provide: OpenFinanceProvider,
          useValue: {
            getName: jest.fn().mockReturnValue('openfinance'),
            getQuote: jest.fn(),
            executeSwap: jest.fn(),
          },
        },
        {
          provide: OkxProvider,
          useValue: {
            getName: jest.fn().mockReturnValue('okx'),
            getQuote: jest.fn(),
            executeSwap: jest.fn(),
          },
        },
        {
          provide: RaydiumProvider,
          useValue: {
            getName: jest.fn().mockReturnValue('raydium'),
            getQuote: jest.fn(),
            executeSwap: jest.fn(),
          },
        },
        {
          provide: EthereumSigner,
          useValue: {
            getAddress: jest.fn(),
            sendTransaction: jest.fn(),
            signMessage: jest.fn(),
          },
        },
        {
          provide: SolanaSigner,
          useValue: {
            getPublicKey: jest.fn(),
            sendTransaction: jest.fn(),
            signMessage: jest.fn(),
          },
        },
        {
          provide: AddressesService,
          useValue: {
            isValidAddress: jest.fn(),
            getCommonTokenAddress: jest.fn(),
            getAllCommonTokens: jest.fn(),
            getNativeWrappedToken: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SwapService>(SwapService);
    oneInchProvider = module.get<OneInchProvider>(OneInchProvider);
    addressesService = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeSwap', () => {
    it('should execute a swap successfully', async () => {
      // Mock dependencies
      jest.spyOn(addressesService, 'isValidAddress').mockReturnValue(true);
      jest.spyOn(oneInchProvider, 'executeSwap').mockResolvedValue({
        txHash: '0x123',
        fromAmount: '1000000000000000000',
        toAmount: '500000000',
        executionPrice: '0.0005',
      });

      // Create swap DTO
      const swapDto: SwapDto = {
        fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        toToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        amount: '1000000000000000000',
        slippage: 0.5,
        chain: 'eth',
        provider: '1inch',
      };

      // Execute swap
      const result = await service.executeSwap(swapDto);

      // Verify result
      expect(result).toEqual({
        txHash: '0x123',
        fromAmount: '1000000000000000000',
        toAmount: '500000000',
        executionPrice: '0.0005',
        provider: '1inch',
      });

      // Verify dependencies were called
      expect(addressesService.isValidAddress).toHaveBeenCalledTimes(2);
      expect(oneInchProvider.executeSwap).toHaveBeenCalledTimes(1);
    });
  });

  describe('getQuotes', () => {
    it('should get quotes from all providers', async () => {
      // Mock dependencies
      jest.spyOn(addressesService, 'isValidAddress').mockReturnValue(true);
      jest.spyOn(oneInchProvider, 'getQuote').mockResolvedValue({
        rate: '0.0005',
        estimatedGas: '150000',
        estimatedFee: '0.005',
      });

      // Create quote DTO
      const quoteDto: QuoteDto = {
        fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        toToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        amount: '1000000000000000000',
        chain: 'eth',
      };

      // Get quotes
      const result = await service.getQuotes(quoteDto);

      // Verify result
      expect(result).toBeDefined();
      expect(result.providers).toBeDefined();
      expect(result.bestProvider).toBeDefined();

      // Verify dependencies were called
      expect(addressesService.isValidAddress).toHaveBeenCalledTimes(2);
      expect(oneInchProvider.getQuote).toHaveBeenCalledTimes(1);
    });
  });
});
