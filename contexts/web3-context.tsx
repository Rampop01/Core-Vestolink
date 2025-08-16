'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'
import { WagmiProvider, http } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Chain } from 'wagmi/chains'
import { useState, useEffect } from 'react'

// Core Blockchain Testnet2 configuration
export const core: Chain = {
  id: 1114,
  name: 'Core Blockchain Testnet2',
  nativeCurrency: {
    decimals: 18,
    name: 'tCORE2',
    symbol: 'tCORE2',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test2.btcs.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Core Testnet Scan',
      url: 'https://scan.test2.btcs.network',
    },
  },
  testnet: true,
}

export const chains = [core] as const;

// Wagmi configuration
const config = getDefaultConfig({
  appName: 'VestoLink',
  projectId: '96aab5ed69f1740a6cb82d7c7a4203e5', // Get this from WalletConnect Cloud
  chains,
  transports: {
    [core.id]: http('https://rpc.test2.btcs.network'),
  },
  ssr: true,
})

const queryClient = new QueryClient()

// Custom VestoLink theme for RainbowKit
const vestolinkTheme: Theme = {
  blurs: {
    modalOverlay: 'blur(4px)',
  },
  colors: {
    accentColor: '#00FFD1',
    accentColorForeground: '#0B0F1A',
    actionButtonBorder: 'rgba(0, 255, 209, 0.2)',
    actionButtonBorderMobile: 'rgba(0, 255, 209, 0.2)',
    actionButtonSecondaryBackground: 'rgba(0, 255, 209, 0.1)',
    closeButton: '#94A3B8',
    closeButtonBackground: 'rgba(148, 163, 184, 0.1)',
    connectButtonBackground: '#00FFD1',
    connectButtonBackgroundError: '#EF4444',
    connectButtonInnerBackground: 'linear-gradient(0deg, rgba(0, 255, 209, 0.1), rgba(0, 255, 209, 0.2))',
    connectButtonText: '#0B0F1A',
    connectButtonTextError: '#FFFFFF',
    connectionIndicator: '#00FFD1',
    downloadBottomCardBackground: 'linear-gradient(126deg, rgba(0, 255, 209, 0.1) 9.49%, rgba(0, 204, 167, 0.1) 71.04%), #1E293B',
    downloadTopCardBackground: 'linear-gradient(126deg, rgba(0, 255, 209, 0.1) 9.49%, rgba(0, 204, 167, 0.1) 71.04%), #1E293B',
    error: '#EF4444',
    generalBorder: 'rgba(0, 255, 209, 0.2)',
    generalBorderDim: 'rgba(148, 163, 184, 0.1)',
    menuItemBackground: 'rgba(0, 255, 209, 0.05)',
    modalBackdrop: 'rgba(11, 15, 26, 0.8)',
    modalBackground: '#1E293B',
    modalBorder: 'rgba(0, 255, 209, 0.2)',
    modalText: '#FFFFFF',
    modalTextDim: '#94A3B8',
    modalTextSecondary: '#CBD5E1',
    profileAction: 'rgba(0, 255, 209, 0.1)',
    profileActionHover: 'rgba(0, 255, 209, 0.2)',
    profileForeground: '#1E293B',
    selectedOptionBorder: 'rgba(0, 255, 209, 0.5)',
    standby: '#FFB800',
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  radii: {
    actionButton: '12px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '16px',
    modalMobile: '16px',
  },
  shadows: {
    connectButton: '0 4px 12px rgba(0, 255, 209, 0.15)',
    dialog: '0 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: '0 2px 6px rgba(0, 255, 209, 0.15)',
    selectedOption: '0 2px 6px rgba(0, 255, 209, 0.24)',
    selectedWallet: '0 2px 6px rgba(0, 255, 209, 0.24)',
    walletLogo: '0 2px 16px rgba(0, 255, 209, 0.16)',
  },
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <RainbowKitProvider theme={vestolinkTheme}>
            {children}
          </RainbowKitProvider>
        ) : (
          <div>{children}</div>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
