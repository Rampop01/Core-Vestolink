import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Web3 utility functions
export function formatTokenAmount(amount: string | number, decimals: number = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (num === 0) return '0'
  if (num < 0.001) return '<0.001'
  if (num < 1) return num.toFixed(3)
  if (num < 1000) return num.toFixed(2)
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  return (num / 1000000).toFixed(1) + 'M'
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const num = parseFloat(amount)
  if (isNaN(num)) return BigInt(0)
  return BigInt(Math.floor(num * Math.pow(10, decimals)))
}

export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
