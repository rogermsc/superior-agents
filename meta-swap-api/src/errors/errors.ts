export class SwapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SwapError';
  }
}

export class ProviderError extends Error {
  constructor(provider: string, message: string) {
    super(`Provider ${provider} error: ${message}`);
    this.name = 'ProviderError';
  }
}

export class SignerError extends Error {
  constructor(chain: string, message: string) {
    super(`Signer for chain ${chain} error: ${message}`);
    this.name = 'SignerError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigurationError';
  }
}
