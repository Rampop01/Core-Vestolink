// This file is no longer used - configuration moved to contexts/web3-context.tsx
// Keeping for reference only

'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, hardhat, localhost } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'VestoLink',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [mainnet, sepolia, hardhat, localhost],
  ssr: true, // If your dApp uses server side rendering (SSR)
})
