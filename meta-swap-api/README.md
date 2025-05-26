# Meta Swap API

A NestJS-based API service supporting multiple aggregators for optimal swap execution across blockchain networks.

## Overview

This API provides a unified interface for executing token swaps across different blockchain networks using multiple aggregators. It abstracts away the complexity of interacting with different DEX aggregators and blockchain networks, providing a consistent interface for trading operations.

## Supported Aggregators

- Ethereum
  - 1inch
  - Kyber
  - OpenFinance
- Solana
  - OKX
  - Raydium

## Features

- **Multi-Chain Support**: Execute swaps across different blockchain networks
- **Aggregator Optimization**: Automatically select the best aggregator based on price and fees
- **Transaction Signing**: Secure transaction signing with multiple signer options
- **Error Handling**: Comprehensive error handling and reporting
- **Modular Architecture**: Easily extendable to support additional chains and aggregators
- **Docker Support**: Containerized deployment for easy setup and scaling

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/meta-swap-api-fork.git

# Navigate to the project directory
cd meta-swap-api-fork

# Copy environment variables template
cp .env.example .env

# Build and start the container
docker compose up --build
```

## Project Structure

```
├── src/
│   ├── app.module.ts         # Main application module
│   ├── main.ts               # Application entry point
│   ├── exception.filter.ts   # Global exception handler
│   ├── logger.instance.ts    # Logger configuration
│   ├── addresses/            # Blockchain address utilities
│   ├── errors/               # Custom error definitions
│   ├── global/               # Global configurations
│   ├── signers/              # Transaction signing utilities
│   ├── swap/                 # Core swap functionality
│   ├── swap-providers/       # Different swap provider implementations
│   └── transfer/             # Token transfer functionality
├── test/                     # Test files
├── .env.example              # Environment variables template
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── package.json              # Project dependencies
└── tsconfig.json             # TypeScript configuration
```

## API Endpoints

### Swap Tokens

```
POST /swap
```

Request body:
```json
{
  "fromToken": "0x...",
  "toToken": "0x...",
  "amount": "1000000000000000000",
  "slippage": 0.5,
  "chain": "eth",
  "provider": "1inch"
}
```

Response:
```json
{
  "txHash": "0x...",
  "fromAmount": "1000000000000000000",
  "toAmount": "500000000",
  "executionPrice": "0.0005",
  "provider": "1inch"
}
```

### Get Quote

```
GET /quote
```

Query parameters:
- `fromToken`: Source token address
- `toToken`: Destination token address
- `amount`: Amount to swap (in wei/lamports)
- `chain`: Blockchain network (eth, solana)

Response:
```json
{
  "providers": [
    {
      "name": "1inch",
      "rate": "0.0005",
      "estimatedGas": "150000",
      "estimatedFee": "0.005"
    },
    {
      "name": "kyber",
      "rate": "0.00049",
      "estimatedGas": "180000",
      "estimatedFee": "0.006"
    }
  ],
  "bestProvider": "1inch"
}
```

## Configuration

The API requires the following environment variables:

```
# Server Configuration
PORT=9009
NODE_ENV=development

# Ethereum Configuration
ETH_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
ETH_PRIVATE_KEY=your-private-key

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your-private-key

# Provider API Keys
ONEINCH_API_KEY=your-1inch-api-key
KYBER_API_KEY=your-kyber-api-key
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build the project
npm run build

# Run tests
npm test
```

## Docker Deployment

The API can be easily deployed using Docker:

```bash
# Build and start the container
docker compose up --build

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f
```

## Error Handling

The API implements comprehensive error handling with custom error types:

- `SwapError`: General swap execution errors
- `ProviderError`: Errors from specific swap providers
- `SignerError`: Transaction signing errors
- `ValidationError`: Input validation errors

All errors are properly logged and returned with appropriate HTTP status codes.

## Security Considerations

- Private keys should be stored securely and never committed to version control
- Use environment variables for all sensitive information
- Consider using a secrets management solution for production deployments
- Implement rate limiting to prevent abuse

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
