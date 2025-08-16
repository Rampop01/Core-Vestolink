import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { VESTOLINK_ABI, TOKEN_ABI } from '@/lib/web3'

// Core Blockchain Testnet2 configuration
const core = {
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
} as const

// Create a public client for read-only contract calls
const publicClient = createPublicClient({
  chain: core,
  transport: http('https://rpc.test2.btcs.network')
})

export async function POST(request: NextRequest) {
  try {
    const { address, abi, functionName, args = [] } = await request.json()

    if (!address || !abi || !functionName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Select the appropriate ABI
    let contractAbi
    switch (abi) {
      case 'vestolink':
        contractAbi = VESTOLINK_ABI
        break
      case 'token':
        contractAbi = TOKEN_ABI
        break
      default:
        return NextResponse.json(
          { error: 'Invalid ABI type' },
          { status: 400 }
        )
    }

    // Make the contract call
    const result = await publicClient.readContract({
      address: address as `0x${string}`,
      abi: contractAbi,
      functionName,
      args,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Contract call error:', error)
    return NextResponse.json(
      { error: error.message || 'Contract call failed' },
      { status: 500 }
    )
  }
}
