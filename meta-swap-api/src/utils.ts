import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

/**
 * Utility functions for the application
 */

/**
 * Formats an amount with the specified number of decimals
 * @param amount The amount to format
 * @param decimals The number of decimals
 * @returns The formatted amount
 */
export function formatAmount(amount: string | number | BigNumber, decimals: number): string {
  return ethers.utils.formatUnits(BigNumber.from(amount), decimals);
}

/**
 * Parses an amount with the specified number of decimals
 * @param amount The amount to parse
 * @param decimals The number of decimals
 * @returns The parsed amount as a BigNumber
 */
export function parseAmount(amount: string, decimals: number): BigNumber {
  return ethers.utils.parseUnits(amount, decimals);
}

/**
 * Shortens an address for display
 * @param address The address to shorten
 * @returns The shortened address
 */
export function shortenAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Validates if a string is a valid Ethereum address
 * @param address The address to validate
 * @returns True if the address is valid, false otherwise
 */
export function isValidEthereumAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

/**
 * Calculates the percentage difference between two values
 * @param value1 The first value
 * @param value2 The second value
 * @returns The percentage difference
 */
export function calculatePercentageDifference(value1: number, value2: number): number {
  if (value1 === 0) return 0;
  return ((value2 - value1) / value1) * 100;
}

/**
 * Applies slippage to an amount
 * @param amount The amount
 * @param slippage The slippage percentage
 * @param increase Whether to increase or decrease the amount
 * @returns The amount with slippage applied
 */
export function applySlippage(
  amount: BigNumber,
  slippage: number,
  increase: boolean = false
): BigNumber {
  const slippageFactor = ethers.utils.parseUnits(
    (1 + (increase ? slippage : -slippage) / 100).toFixed(6),
    6
  );
  return amount.mul(slippageFactor).div(ethers.utils.parseUnits('1', 6));
}

/**
 * Waits for a specified number of milliseconds
 * @param ms The number of milliseconds to wait
 * @returns A promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
